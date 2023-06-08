import { useLiveQuery } from "dexie-react-hooks";
import { db, Message, Role } from "./db";

export function useChatSessions() {
  return useLiveQuery(() =>
    db.chatSessions.orderBy("createdAt").reverse().toArray()
  );
}

export function useChatSession(sessionId: number | undefined) {
  return useLiveQuery(
    () => (sessionId ? db.chatSessions.get(sessionId) : undefined),
    [sessionId]
  );
}

export async function addChatSession(name: string): Promise<number> {
  const createdAt = new Date();
  return db.chatSessions.add({ name, createdAt });
}

export function useMessages(sessionId: number | undefined) {
  return useLiveQuery(() => {
    console.log("useMessages", sessionId);
    return sessionId
      ? db.messages.where("sessionId").equals(sessionId).toArray()
      : [];
  }, [sessionId]);
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
  console.debug("saveMessages", sessionId, messages);
  if (!sessionId) {
    return;
  }
  return db.transaction("rw", db.messages, async () => {
    await db.messages.where("sessionId").equals(sessionId).delete();
    await db.messages.bulkPut(messages.map((m) => ({ ...m, sessionId })));
  });
}

export async function deleteChatSession(sessionId: number) {
  await db.messages.where("sessionId").equals(sessionId).delete();
  await db.chatSessions.delete(sessionId);
}
