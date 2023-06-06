import Dexie from "dexie";

class ChatDatabase extends Dexie {
  chatSessions: Dexie.Table<ChatSession, number>;
  messages: Dexie.Table<Message, number>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chatSessions: "++id, name, createdAt",
      messages: "++id, sessionId, content, timestamp",
    });

    this.chatSessions = this.table("chatSessions");
    this.messages = this.table("messages");
  }
}

export type Role = "human" | "ai" | "system" | "generic";
export interface ChatSession {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface Message {
  id?: number;
  sessionId: number;
  role: Role;
  content: string;
  error?: string;
  timestamp: Date;
}

export const db = new ChatDatabase();
