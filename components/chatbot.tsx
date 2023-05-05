import React, { Dispatch, useEffect, useReducer, useRef } from "react";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import Message from "@/components/message";
import ActionButton from "@/components/action-button";
import { PaperAirplaneIcon, StopIcon } from "@heroicons/react/24/outline";
import { Select } from "@/components/select";
import { state } from "sucrase/dist/types/parser/traverser/base";
import { chat } from "@/libs/chat";
import { Simulate } from "react-dom/test-utils";
import abort = Simulate.abort;
import { StopCircleIcon } from "@heroicons/react/24/solid";
import Panel from "@/components/Panel";

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
  inputMessage: string;
  currentMessage: string[] | null;
  sendingMessage: boolean;
}

type ChatbotAction =
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
      message: string;
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
  chatMessages: [
    // new SystemChatMessage(
    //   "You are a truthful assistant to an intelligent well-educated human. " +
    //     "You write directly into the browser Markdown interpreter. " +
    //     "You always write your response in Markdown. " +
    //     "Use $\\KaTeX$ for displaying math formulas (using \n$$\n...\n$$\n\n for block, and $...$ for inline). " +
    //     "Use hierarchical headings. " +
    //     "Use tables, emojis, headings, lists, **well-formed** *mermaid*, links. " +
    //     "Use **bold** and *italics* for **highlighting** and *emphasis*. " +
    //     "You can display maps and routes in a well-formed iframe using google maps. " +
    //     "Prefer concise answers but don't sacrifice correctness. " +
    //     "Not need to be polite, but don't be rude."
    // ),
    new SystemChatMessage(`
You are a browser-based assistant! Designed for intelligent and well-educated users, you provide truthful and efficient support through the browser's Markdown interpreter.

## Key features and mandatory instructions for your responses:

- Display math formulas, algorithms and other $\\LaTeX$ content using $\\KaTeX$ dialect (using

$$
block formula, algorithm, table, code, etc.
$$

or $inline formula$)
- Write directly to the browser Markdown interpreter
- Write titles. Organize content with hierarchical headings
- Enhance messages with tables, emojis, headings, lists, **well-formed** *mermaid*, links, **bold**, and *italics*
- Show maps and routes in well-formed iframes with Google Maps. Just write the HTML code without escaping it.
- You can render widgets in HTML/JS/CSS directly writing an iframe tag and the HTML code inside it.
- Provide concise and accurate answers without sacrificing correctness
- Experience a straightforward, respectful, and professional communication style
    `),
    // new HumanChatMessage("Render a Hello world application in an iframe."),
    // new AIChatMessage(
    //   "<iframe srcdoc='<html><body><h1>Hello world</h1></body></html>'></iframe>"
    // ),
  ],
  inputMessage: "",
  currentMessage: null,
  sendingMessage: false,
};

function reducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
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
      };
    case "ADD_HUMAN_MESSAGE":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          new HumanChatMessage(action.message),
        ],
        sendingMessage: true,
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

function Chatbot() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const abortController = useRef<AbortController>(new AbortController());

  useEffect(() => {
    if (state.sendingMessage) {
      handleButtonClick(state.chatMessages).finally(() =>
        dispatch({ type: "HUMAN_MESSAGE SENT" })
      );
    }
  }, [state.sendingMessage]);

  const reader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const handleButtonClick = async (messages: BaseChatMessage[]) => {
    try {
      dispatch({ type: "START_AI_MESSAGE" });
      const response = await chat(
        state.settings,
        messages,
        (message) => dispatch({ type: "ADD_TOKEN", token: message }),
        abortController.current.signal,
        process.env.OPENAI_API_KEY!
      );
    } catch (error) {
      console.error("Error streaming chatbot");
      console.error(error);
    } finally {
      dispatch({ type: "END_AI_MESSAGE" });
    }
  };

  return (
    <div className="h-full relative flex flex-col justify-between">
      <ul className="flex flex-col gap-1">
        {state.chatMessages.map((message, index) => (
          <Message
            message={message.text}
            role={message._getType()}
            key={index}
          />
        ))}

        {state.currentMessage && (
          <div className="relative">
            <Message
              message={state.currentMessage.join("")}
              role="ai"
              partial
            />
            <ActionButton
              icon={StopCircleIcon}
              rounded
              className="absolute -top-4 -right-5 p-0"
              size="xs"
              onClick={async (event) => {
                event.preventDefault();
                abortController.current.abort("User aborted");
                abortController.current = new AbortController();
              }}
            >
              Cancel
            </ActionButton>
          </div>
        )}
      </ul>

      <div className="">
        <Panel>
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
            <div className="flex flex-row gap-2 items-start">
              <div className="flex-grow">
                <Textarea
                  label={"Your message"}
                  placeholder={"Type your message here"}
                  ref={inputRef}
                  value={state.inputMessage}
                  rows={1}
                  onChange={(event) => {
                    dispatch({
                      type: "CHANGE_INPUT_MESSAGE",
                      message: event.target.value,
                    });
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      state.inputMessage.trim() !== ""
                    ) {
                      event.preventDefault();
                      dispatch({
                        type: "ADD_HUMAN_MESSAGE",
                        message: state.inputMessage,
                      });
                      dispatch({ type: "CHANGE_INPUT_MESSAGE", message: "" });
                    }
                  }}
                />
              </div>

              <ActionButton
                icon={PaperAirplaneIcon}
                disabled={!state.inputMessage}
                type={"submit"}
                color={"primary"}
                onClick={async (event) => {
                  event.preventDefault();
                  dispatch({
                    type: "ADD_HUMAN_MESSAGE",
                    message: state.inputMessage,
                  });
                  dispatch({ type: "CHANGE_INPUT_MESSAGE", message: "" });
                }}
              >
                Send
              </ActionButton>
            </div>
          </form>
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
