import {
  AIChatMessage,
  BaseChatMessage,
  ChainValues,
  ChatResult,
} from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { CallbackManagerForLLMRun } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

class AbortableChatOpenAI extends ChatOpenAI {
  abortSignal: AbortSignal;

  constructor(
    abortSignal: AbortSignal,
    ...args: ConstructorParameters<typeof ChatOpenAI>
  ) {
    super(...args);
    this.abortSignal = abortSignal;
  }

  async _generate(
    messages: BaseChatMessage[],
    stopOrOptions?: string[] | this["CallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    let newOptions: this["CallOptions"];
    if (Array.isArray(stopOrOptions)) {
      newOptions = {
        stop: stopOrOptions,
        options: { signal: this.abortSignal },
      } as this["CallOptions"];
    } else {
      newOptions = {
        stop: stopOrOptions?.stop,
        options: { ...stopOrOptions?.options, signal: this.abortSignal },
      } as this["CallOptions"];
    }

    // This is a bit hacky, we need to override the handleLLMNewToken method
    // to be able to get the current message being generated, otherwise it would
    // be lost.
    const prevHandleLLMNewToken = runManager?.handleLLMNewToken;
    const currentMessage: string[] = [];
    if (runManager) {
      runManager.handleLLMNewToken = async (token: string) => {
        currentMessage.push(token);
        await prevHandleLLMNewToken?.call(runManager, token);
      };
    }

    try {
      return await super._generate(messages, newOptions, runManager);
    } catch (e: any) {
      if (e.name === "Error" && e.message === "Cancel: canceled") {
        return {
          generations: [
            {
              text: currentMessage.join(""),
              message: new AIChatMessage(currentMessage.join("")),
            },
          ],
          llmOutput: {
            tokenUsage: {},
          },
        };
      } else {
        throw e;
      }
    } finally {
      // Restore the original handleLLMNewToken method
      if (runManager && prevHandleLLMNewToken) {
        runManager.handleLLMNewToken = prevHandleLLMNewToken;
      }
    }
  }
}

export async function chat(
  settings: any,
  systemMessage: string,
  inputMessage: string,
  chatMessageHistory: ChatMessageHistory,
  handleNewToken: (token: string) => void,
  abortSignal: AbortSignal,
  openAIApiKey: string
) {
  const chatStreaming = new AbortableChatOpenAI(abortSignal, {
    modelName: settings.model,
    maxTokens: settings.maxTokens,
    temperature: settings.temperature,
    topP: settings.topP,
    presencePenalty: settings.presencePenalty,
    frequencyPenalty: settings.frequencyPenalty,
    streaming: true,
    // timeout: 1000,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          handleNewToken(token);
        },
      },
    ],

    openAIApiKey: openAIApiKey,
    // verbose: true,
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const memory = new BufferWindowMemory({
    returnMessages: true,
    memoryKey: "history",
    chatHistory: chatMessageHistory,
    k: 5, // this is the number of interactions to return (multiplied by 2)
  });

  const chain = new ConversationChain({
    llm: chatStreaming,
    prompt: chatPrompt,
    verbose: false,
    memory: memory,
    callbacks: [
      {
        async handleChainEnd(
          outputs: ChainValues,
          runId: string,
          parentRunId?: string
        ): Promise<void> {
          console.log(
            "Tokens",
            await chatStreaming.getNumTokensFromMessages(
              await memory.chatHistory.getMessages()
            )
          );
        },
        handleChainError(
          err: Error,
          runId: string,
          parentRunId?: string
        ): Promise<void> | void {
          console.log("handleChainError", err, runId, parentRunId);
        },
      },
    ],
  });

  return await chain.call({
    input: inputMessage,
  });
}
