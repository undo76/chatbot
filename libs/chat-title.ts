import { BaseChatMessage } from "langchain/schema";

export async function chatTitle(messages: BaseChatMessage[]) {
  return messages[1]?.text;
}
