import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  const uri = MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  global.mongooseCache = globalCache;

  return globalCache.conn;
}
