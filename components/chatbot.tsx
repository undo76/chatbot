import { Dispatch, useEffect, useReducer, useRef } from "react";
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
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Select } from "@/components/select";
import { state } from "sucrase/dist/types/parser/traverser/base";

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
  currentMessage: string[];
  sendingMessage: boolean;
  interrupted: boolean;
}

type ChatbotAction =
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
      type: "INTERRUPT";
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
Welcome to your browser-based Markdown assistant! Designed for intelligent and well-educated users like you, this assistant provides truthful and efficient support through the browser's Markdown interpreter.

Key features and guidelines for our interactions:

- Display math formulas using $\\KaTeX$ (\`

$$
block formula
$$

or $inline formula$)
- Organize content with hierarchical headings
- Enhance messages with tables, emojis, headings, lists, **well-formed** *mermaid*, links, **bold**, and *italics*
- Showcase maps and routes in well-formed iframes with Google Maps
- Receive concise and accurate answers without sacrificing correctness
- Experience a straightforward, respectful, and professional communication style

Let's begin our productive collaboration and achieve great results together!
`),
  ],
  inputMessage: "",
  currentMessage: [],
  sendingMessage: false,
  interrupted: false,
};

function reducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case "ADD_TOKEN":
      return {
        ...state,
        currentMessage: [...state.currentMessage, action.token],
      };
    case "END_AI_MESSAGE":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          new AIChatMessage(state.currentMessage.join("")),
        ],
        currentMessage: [],
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
    case "INTERRUPT":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          new AIChatMessage(state.currentMessage.join("")),
        ],
        interrupted: true,
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
      <Input
        label={"Max tokens"}
        value={props.state.settings.maxTokens}
        className="w-24"
        type="number"
        min={1}
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

  useEffect(() => {
    if (state.sendingMessage) {
      handleButtonClick(state.chatMessages).finally(() =>
        dispatch({ type: "HUMAN_MESSAGE SENT" })
      );
    }
  }, [state.sendingMessage]);

  const reader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const handleButtonClick = async (messages: BaseChatMessage[]) => {
    const response = await fetch("/api/streamDemo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: state.settings,
        messages: messages.map((message) => ({
          type:
            message instanceof AIChatMessage
              ? "ai"
              : message instanceof HumanChatMessage
              ? "human"
              : message instanceof SystemChatMessage
              ? "system"
              : "unknown",
          text: message.text,
        })),
      }),
    });
    if (!response.ok) {
      console.error("Error streaming chatbot");
      console.error(response);
      return;
    }
    const stream = response.body;
    reader.current = stream?.getReader() || null;

    if (!reader.current) {
      console.error("Error getting reader");
      return;
    }

    try {
      while (true) {
        const { done, value } = await reader.current.read();
        if (done) {
          dispatch({ type: "END_AI_MESSAGE" });
          break;
        }
        const decodedValue = new TextDecoder().decode(value);
        dispatch({ type: "ADD_TOKEN", token: decodedValue });
      }
    } catch (error) {
      console.error(error);
    } finally {
      reader.current.releaseLock();
    }
  };

  return (
    <>
      <ul className="flex flex-col gap-1">
        {state.chatMessages.map((message, index) => (
          <Message
            message={message.text}
            role={message._getType()}
            key={index}
          />
        ))}

        {state.currentMessage.length > 0 && (
          <Message message={state.currentMessage.join("")} role="ai" partial />
        )}
        <hr className="my-2" />
      </ul>

      <form className="mt-4">
        <ChatbotOptions
          state={state}
          onSettingsChange={(key, value) => {
            handleSettingsChange(dispatch, key, value);
          }}
        />
        <Textarea
          label={"Your message"}
          placeholder={"Type your message here"}
          ref={inputRef}
          value={state.inputMessage}
          onChange={(event) => {
            dispatch({
              type: "CHANGE_INPUT_MESSAGE",
              message: event.target.value,
            });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              dispatch({
                type: "ADD_HUMAN_MESSAGE",
                message: state.inputMessage,
              });
              dispatch({ type: "CHANGE_INPUT_MESSAGE", message: "" });
            }
          }}
        />

        <div className="flex mt-2 gap-1">
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
          <ActionButton
            disabled={!reader.current}
            onClick={async (event) => {
              event.preventDefault();
              await reader.current?.cancel("Interrupted");
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton
            disabled={state.sendingMessage}
            className="ml-auto"
            onClick={async (event) => {
              event.preventDefault();
              dispatch({ type: "RESET" });
            }}
          >
            Reset
          </ActionButton>
        </div>
      </form>
    </>
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
