import { useLiveQuery } from "dexie-react-hooks";
import { db, Message, Role } from "./db";

export function useChatSessions() {
  return useLiveQuery(() => db.chatSessions.orderBy("id").reverse().toArray());
}

export function useMessages(sessionId: number | null) {
  return useLiveQuery(
    () =>
      sessionId
        ? db.messages.where("sessionId").equals(sessionId).toArray()
        : [],
    [sessionId]
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

export async function saveMessages(
  sessionId: number | null,
  messages: Message[]
) {
  if (!sessionId) {
    return Promise.resolve();
  }
  await db.messages.bulkPut(messages.map((m) => ({ ...m, sessionId })));
}

export async function deleteChatSession(sessionId: number) {
  await db.chatSessions.delete(sessionId);
  await db.messages.where("sessionId").equals(sessionId).delete();
}
