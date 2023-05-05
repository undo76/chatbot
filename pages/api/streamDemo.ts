import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

import { NextApiRequest, NextApiResponse } from "next";
import { chat } from "@/libs/chat";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY is not defined.");
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    // Read json payload
    if (req.method !== "POST") {
      throw new Error("Invalid method");
    }

    console.log(req.body);
    const body = req.body;

    const messages: BaseChatMessage[] = body.messages.map(
      (message: { type: string; text: string }) => {
        if (message.type === "human") {
          return new HumanChatMessage(message.text);
        } else if (message.type === "ai") {
          return new AIChatMessage(message.text);
        } else if (message.type === "system") {
          return new SystemChatMessage(message.text);
        } else {
          throw new Error("Invalid message type");
        }
      }
    );

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Transfer-Encoding", "chunked");

    const handleNewToken = (token: string) => {
      res.write(`${token}`);
    };

    // await chat(body.settings, messages, handleNewToken, OPENAI_API_KEY);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  } finally {
    console.log("Closing response");
    await res.end();
  }
}
