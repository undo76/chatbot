import { BaseChatMessage, HumanChatMessage } from "langchain/schema";
import {
  BaseChatMemory,
  BufferMemory,
  BufferWindowMemory,
} from "langchain/memory";
import { useCallback, useRef } from "react";
import { chat } from "@/libs/chat";

export function useChatMessages(
  session: number,
  settings: any,
  systemMessage: string,
  handleNewToken: (message: string) => void,
  abortController: AbortController,
  openAIApiKey?: string
) {
  const memoryRef = useRef<BufferMemory>(
    new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
    })
  );

  const addMessage = useCallback(
    async (inputMessage: string) => {
      await chat(
        settings,
        systemMessage,
        inputMessage,
        memoryRef.current,
        handleNewToken,
        abortController.signal,
        settings.openAiKey ?? ""
      );
    },
    [settings, systemMessage, abortController, handleNewToken]
  );

  return { memory: memoryRef.current, addMessage };
}
