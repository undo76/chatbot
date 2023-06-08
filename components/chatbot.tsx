import React, {
  Dispatch,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import MessagePanel from "@/components/message-panel";
import ActionButton from "@/components/action-button";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Select } from "@/components/select";
import { chat } from "@/libs/chat";
import { StopCircleIcon } from "@heroicons/react/24/solid";
import Panel from "@/components/Panel";
import { ChatMessageHistory } from "langchain/memory";
import { useSettings } from "@/components/settings";
import { DEFAULT_PROMPT } from "@/libs/prompts";
import { addChatSession, saveMessages, useMessages } from "@/libs/use-chat";
import { chatTitle } from "@/libs/chat-title";
import { useRouter } from "next/router";
import { Message } from "@/libs/db";

interface ChatbotState {
  settings: {
    model: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  chatMessages: BaseChatMessage[];
  inputMessage: string | null;
  currentMessage: string[] | null;
  sendingMessage: boolean;
  savingMessages: boolean;
  // memory: BaseChatMemory;
}

type ChatbotAction =
  | {
      type: "LOAD_MESSAGES";
      messages: BaseChatMessage[];
    }
  | {
      type: "START_AI_MESSAGE";
    }
  | {
      type: "ADD_TOKEN";
      token: string;
    }
  | {
      type: "END_AI_MESSAGE";
    }
  | {
      type: "MESSAGES_SAVED";
    }
  | {
      type: "ADD_HUMAN_MESSAGE";
      message: string;
    }
  | {
      type: "HUMAN_MESSAGE SENT";
    }
  | {
      type: "CHANGE_SETTINGS";
      settings: Partial<ChatbotState["settings"]>;
    }
  | {
      type: "RESET";
    }
  | {
      type: "CHANGE_INPUT_MESSAGE";
      message: string | null;
    };

const DEFAULT_STATE: ChatbotState = {
  settings: {
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
    temperature: 0.2,
    topP: 0.5,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  chatMessages: [new SystemChatMessage(DEFAULT_PROMPT)],
  inputMessage: null,
  currentMessage: null,
  sendingMessage: false,
  savingMessages: false,
};

function reducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case "LOAD_MESSAGES":
      return {
        ...state,
        chatMessages: action.messages,
      };
    case "START_AI_MESSAGE":
      return {
        ...state,
        currentMessage: [],
      };
    case "ADD_TOKEN":
      return {
        ...state,
        currentMessage: [...(state.currentMessage ?? []), action.token],
      };
    case "END_AI_MESSAGE":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          new AIChatMessage((state.currentMessage ?? []).join("")),
        ],
        currentMessage: null,
        savingMessages: true,
      };
    case "MESSAGES_SAVED":
      return {
        ...state,
        savingMessages: false,
      };
    case "ADD_HUMAN_MESSAGE":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          new HumanChatMessage(action.message),
        ],
        sendingMessage: true,
        inputMessage: null,
      };
    case "HUMAN_MESSAGE SENT":
      return {
        ...state,
        sendingMessage: false,
      };
    case "CHANGE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };
    case "RESET":
      return {
        ...DEFAULT_STATE,
      };
    case "CHANGE_INPUT_MESSAGE":
      return {
        ...state,
        inputMessage: action.message,
      };
    default:
      console.error("Unknown action type", action);
      return state;
  }
}

function ChatbotOptions(props: {
  state: ChatbotState;
  onSettingsChange: (key: string, value: any) => void;
}) {
  return (
    <div className="flex flex-row gap-2 my-2">
      <div className="flex-grow">
        <Select
          label={"Model"}
          value={props.state.settings.model}
          onChange={(e) =>
            props.onSettingsChange("model", e.target.value as string)
          }
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </Select>
      </div>
      <Input
        label={"Max tokens"}
        value={props.state.settings.maxTokens}
        className="w-24"
        type="number"
        min={0}
        step={100}
        onChange={(e) =>
          props.onSettingsChange("maxTokens", parseInt(e.target.value) || 1000)
        }
      />
      <Input
        label={"Temperature"}
        value={props.state.settings.temperature}
        className="w-24"
        type="number"
        min={0.0}
        max={1.0}
        step={0.1}
        onChange={(e) =>
          props.onSettingsChange("temperature", parseFloat(e.target.value))
        }
      />
      <Input
        label={"Top P"}
        value={props.state.settings.topP}
        className="w-24"
        type="number"
        min={0.0}
        max={1.0}
        step={0.1}
        onChange={(e) =>
          props.onSettingsChange("topP", parseFloat(e.target.value) || 1)
        }
      />
    </div>
  );
}

function loadMessages(messages: Message[]): BaseChatMessage[] {
  return messages.map((message) => {
    if (message.role === "system") {
      return new SystemChatMessage(message.content);
    } else if (message.role === "human") {
      return new HumanChatMessage(message.content);
    } else if (message.role === "ai") {
      return new AIChatMessage(message.content);
    } else {
      throw new Error("Unknown message role");
    }
  });
}

function Chatbot({ sessionId }: { sessionId?: number }) {
  const messages = useMessages(sessionId);
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const abortController = useRef<AbortController>(new AbortController());
  const { settings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (sessionId && messages) {
      dispatch({ type: "LOAD_MESSAGES", messages: loadMessages(messages) });
    }
  }, [messages, sessionId]);

  const handleButtonClick = useCallback(
    async (messages: BaseChatMessage[]) => {
      try {
        dispatch({ type: "START_AI_MESSAGE" });

        const response = await chat(
          state.settings,
          messages[0].text,
          messages[messages.length - 1].text,
          new ChatMessageHistory(state.chatMessages.slice(1)),
          (message) => dispatch({ type: "ADD_TOKEN", token: message }),
          abortController.current.signal,
          settings.openAiKey ?? ""
        );
      } catch (error: any) {
        if (error.name === "Error" && error.message === "Cancel: canceled") {
          console.log("AI message canceled");
        } else {
          console.error("Error in AI message", error);
        }
      } finally {
        dispatch({ type: "END_AI_MESSAGE" });
      }
    },
    [state, settings.openAiKey]
  );

  useEffect(() => {
    if (state.sendingMessage) {
      handleButtonClick(state.chatMessages).finally(() =>
        dispatch({ type: "HUMAN_MESSAGE SENT" })
      );
    }
  }, [state.sendingMessage]);

  useEffect(() => {
    if (!state.savingMessages) {
      return;
    }

    Promise.resolve().then(async () => {
      console.debug("Saving messages");
      let sid = sessionId;
      if (!sessionId) {
        const title = await chatTitle(state.chatMessages);
        sid = await addChatSession(title);
      }
      await saveMessages(
        sid!,
        state.chatMessages.map((message) => ({
          sessionId: sid!,
          timestamp: new Date(),
          role: message._getType(),
          content: message.text,
        }))
      );
      if (!sessionId) {
        await router.replace(`/chat/${sid}`);
      }
      dispatch({ type: "MESSAGES_SAVED" });
    });
  }, [state.chatMessages, state.savingMessages, sessionId, router]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter") {
        if (!event.shiftKey) {
          event.preventDefault();
        }
        if (
          !event.shiftKey &&
          state.inputMessage &&
          state.inputMessage.trim() !== "" &&
          !state.currentMessage?.length
        ) {
          if (state.currentMessage?.length) return;
          dispatch({
            type: "ADD_HUMAN_MESSAGE",
            message: state.inputMessage,
          });
        }
      }
    },
    [state.inputMessage, state.currentMessage]
  );

  return (
    <div className="flex flex-col justify-around gap-4">
      {/*<pre className="text-xs whitespace-pre-wrap">*/}
      {/*  {JSON.stringify(messages, null, 2)}*/}
      {/*</pre>*/}
      <ul className="flex flex-col gap-1 mb-auto">
        {state.chatMessages.map((message, index) => (
          <MessagePanel
            content={message.text}
            role={message._getType()}
            key={index}
          />
        ))}

        {state.currentMessage && (
          <MessagePanel
            content={state.currentMessage.join("")}
            role="ai"
            nTokens={state.currentMessage.length}
            partial
          />
        )}
      </ul>

      {/*<div className="flex flex-col gap-2">{JSON.stringify(messages)}</div>*/}

      <div className="relative mt-auto">
        <Panel>
          {!settings.openAiKey ? (
            <div className="flex flex-col gap-2">
              <p>
                You need to set your OpenAI API key in the settings to use the
                chatbot.
              </p>
            </div>
          ) : (
            <form>
              <ChatbotOptions
                state={state}
                onSettingsChange={(key, value) => {
                  handleSettingsChange(dispatch, key, value);
                }}
              />
              {/*<ActionButton*/}
              {/*  disabled={state.sendingMessage}*/}
              {/*  className="ml-auto"*/}
              {/*  onClick={async (event) => {*/}
              {/*    event.preventDefault();*/}
              {/*    dispatch({ type: "RESET" });*/}
              {/*  }}*/}
              {/*>*/}
              {/*  Reset*/}
              {/*</ActionButton>*/}
              <div className="flex flex-row gap-1 items-stretch">
                <div className="flex-grow">
                  <Textarea
                    // label={"Your message"}
                    placeholder={"Type your message here"}
                    ref={inputRef}
                    value={state.inputMessage || ""}
                    rows={1}
                    onChange={(event) => {
                      dispatch({
                        type: "CHANGE_INPUT_MESSAGE",
                        message: event.target.value,
                      });
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <button
                  disabled={
                    !state.inputMessage ||
                    state.inputMessage.trim() === "" ||
                    !!state.currentMessage?.length
                  }
                  type={"submit"}
                  className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm enabled:hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async (event) => {
                    event.preventDefault();
                    dispatch({
                      type: "ADD_HUMAN_MESSAGE",
                      message: state.inputMessage ?? "",
                    });
                  }}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
          {state.currentMessage && (
            <ActionButton
              icon={StopCircleIcon}
              rounded
              className="absolute -top-5 right-0 left-0 p-0 mx-auto w-24 shadow"
              size="xs"
              onClick={async (event) => {
                event.preventDefault();
                abortController.current.abort("User aborted");
                abortController.current = new AbortController();
              }}
            >
              Cancel
            </ActionButton>
          )}
        </Panel>
      </div>
    </div>
  );
}

function handleSettingsChange(
  dispatch: Dispatch<ChatbotAction>,
  key: string,
  value: any
) {
  dispatch({
    type: "CHANGE_SETTINGS",
    settings: {
      [key]: value,
    },
  });
}

export default Chatbot;
