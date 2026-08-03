import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDb(): Promise<Db> {
  // Railway Mongo plugin often sets MONGO_URL; also support MONGODB_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI or MONGO_URL (Railway MongoDB plugin).');
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  const client = await global._mongoClientPromise;
  return client.db(process.env.MONGODB_DB || 'nox_chat');
}
