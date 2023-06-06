import { useLiveQuery } from "dexie-react-hooks";
import { db, Role } from "./db";

export function useChatSessions() {
  return useLiveQuery(() => db.chatSessions.orderBy("id").reverse().toArray());
}

export function useMessages(sessionId: number) {
  return useLiveQuery(() =>
    db.messages.where("sessionId").equals(sessionId).toArray()
  );
}

export async function addChatSession(name: string): Promise<number> {
  const createdAt = new Date();
  return db.chatSessions.add({ name, createdAt });
}

export async function addMessage(
  sessionId: number,
  role: Role,
  content: string
) {
  const timestamp = new Date();
  return db.messages.add({ sessionId, role, content, timestamp });
}

export async function deleteChatSession(sessionId: number) {
  await db.chatSessions.delete(sessionId);
  await db.messages.where("sessionId").equals(sessionId).delete();
}
