import { BaseChatMessage } from "langchain/schema";

export function chatTitle(messages: BaseChatMessage[]) {
  return messages[1]?.text;
}
