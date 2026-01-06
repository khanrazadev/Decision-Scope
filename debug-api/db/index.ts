
import { MongoClient, Db, Collection } from "mongodb";

let db: Db;

export async function connectDB(uri: string, dbName: string): Promise<Db> {
  const client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  return db;
}


export function getFlowsCollection(): Collection {
  if (!db) throw new Error("DB not initialized");
  return db.collection("flows");
}

export function getStagesCollection(): Collection {
  if (!db) throw new Error("DB not initialized");
  return db.collection("stages");
}
