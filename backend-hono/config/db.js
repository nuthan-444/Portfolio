import { MongoClient, ObjectId } from 'mongodb';

/**
 * Opens (or reuses within the same request) a MongoDB connection bound
 * strictly to the current Hono request context `c`.
 *
 * Cloudflare Workers forbid sharing TCP/TLS sockets across different requests
 * ("Cannot perform I/O on behalf of a different request"), so each request
 * gets its own short-lived MongoClient that is closed in middleware `finally`.
 */
export const getDB = async (c) => {
  const existingDb = c.get('_mongoDb');
  if (existingDb) return existingDb;

  // Avoid retrying if this request already failed to connect
  if (c.get('_mongoFailed')) return null;

  const uri = c.env?.MONGODB_URI || 'mongodb://127.0.0.1:27017/MyPortfolio';

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    const msg = 'Invalid MONGODB_URI format.';
    console.warn(`[DB] ${msg}`);
    c.set('_mongoFailed', true);
    c.set('dbError', msg);
    return null;
  }

  let client;
  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 1,
      minPoolSize: 0,
    });

    await client.connect();
    // client.db() uses the database name from the URI path (e.g. /MyPortfolio)
    const db = client.db();

    c.set('_mongoClient', client);
    c.set('_mongoDb', db);
    return db;
  } catch (error) {
    console.warn(`[DB Warning] MongoDB Connection Failed: ${error.message}`);
    c.set('_mongoFailed', true);
    c.set('dbError', error.message);
    if (client) {
      await client.close().catch(() => {});
    }
    return null;
  }
};

/**
 * Closes the request-scoped MongoClient if one was opened during this request.
 */
export const closeDB = async (c) => {
  const client = c.get('_mongoClient');
  if (client) {
    c.set('_mongoClient', null);
    c.set('_mongoDb', null);
    await client.close().catch(() => {});
  }
};

/**
 * Safely converts a 24-character hex string into a MongoDB ObjectId.
 * Returns null if the string is not a valid ObjectId.
 */
export const toObjectId = (id) => {
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return new ObjectId(id);
  }
  return null;
};
