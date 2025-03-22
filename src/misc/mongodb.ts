import { MongoClient } from 'mongodb';

let client: MongoClient;

export async function connectToMongoDB(uri: string) {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

export async function getMongoDBItem<T>(key: string): Promise<T | null> {
  const db = client.db();
  const collection = db.collection('sharedchats');
  const item = await collection.findOne({ key });
  return item ? (item.value as T) : null;
}

export async function setMongoDBItem<T>(key: string, value: T): Promise<void> {
  const db = client.db();
  const collection = db.collection('sharedchats');
  await collection.updateOne({ key }, { $set: { value } }, { upsert: true });
}

export async function removeMongoDBItem(key: string): Promise<void> {
  const db = client.db();
  const collection = db.collection('sharedchats');
  await collection.deleteOne({ key });
}

export async function clearMongoDB(): Promise<void> {
  const db = client.db();
  const collection = db.collection('sharedchats');
  await collection.deleteMany({});
}
