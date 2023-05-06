import { BaseChatMessage, BasePromptValue, LLMResult } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import {
  BaseChatMemory,
  BufferMemory,
  ChatMessageHistory,
} from "langchain/memory";
import { Callbacks } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

export async function chat(
  settings: any,
  systemMessage: string,
  inputMessage: string,
  memory: BaseChatMemory,
  handleNewToken: (token: string) => void,
  abortSignal: AbortSignal,
  openAIApiKey: string
) {
  class AbortableChatOpenAI extends ChatOpenAI {
    abortSignal: AbortSignal;

    constructor(
      abortSignal: AbortSignal,
      ...args: ConstructorParameters<typeof ChatOpenAI>
    ) {
      super(...args);
      this.abortSignal = abortSignal;
    }

    generatePrompt(
      promptValues: BasePromptValue[],
      stop?: string[] | this["CallOptions"],
      callbacks?: Callbacks
    ): Promise<LLMResult> {
      return super.generatePrompt(
        promptValues,
        {
          options: { signal: this.abortSignal, stop: stop },
        } as this["CallOptions"],
        callbacks
      );
    }
  }

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
          // abortController.abort("Request was aborted");
          handleNewToken(token);
        },
      },
    ],
    openAIApiKey: openAIApiKey || "sk-xxx",
  });

  // const lastMessage = messages[messages.length - 1];
  // const restMessages = messages.slice(0, messages.length - 1);

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chainB = new ConversationChain({
    llm: chatStreaming,
    prompt: chatPrompt,
    // verbose: true,
    memory: memory,
  });

  await chainB.call({
    input: inputMessage,
  });
}
