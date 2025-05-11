// lib/db.ts
import { openDB } from "idb";

const DB_NAME = "ScreenRecorderDB";
const STORE_NAME = "chunks";

export const getDB = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "timestamp",
          autoIncrement: true,
        });
      }
    },
  });

export const saveChunk = async (chunk: Blob, sessionId: string) => {
  const db = await getDB();
  await db.add(STORE_NAME, { chunk, sessionId, timestamp: Date.now() });
};

export const getAllChunksBySession = async (sessionId: string) => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  return all
    .filter((entry) => entry.sessionId === sessionId)
    .map((entry) => entry.chunk);
};

export const clearChunksBySession = async (sessionId: string) => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  for (const entry of all) {
    if (entry.sessionId === sessionId) {
      await store.delete(entry.timestamp);
    }
  }
};
