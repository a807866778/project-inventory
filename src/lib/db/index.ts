import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

// Create D1 client lazily - only at runtime, not during build
let _db: ReturnType<typeof drizzle> | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  const client = createClient({ 
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN 
  });
  return drizzle(client, { schema });
}

function getDbInstance() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Export a db-like proxy that works with all drizzle methods
export const db: ReturnType<typeof drizzle> = new Proxy({} as any, {
  get(_, prop) {
    const database = getDbInstance();
    if (!database) {
      // Return empty/mock functions when no DB (build time)
      if (prop === 'select') return () => Promise.resolve([]);
      if (prop === 'insert') return () => Promise.resolve({});
      if (prop === 'update') return () => Promise.resolve({});
      if (prop === 'delete') return () => Promise.resolve({});
      if (prop === 'query') return { materials: { findFirst: () => Promise.resolve(null), findMany: () => Promise.resolve([]) } };
      if (prop === '$count') return () => Promise.resolve(0);
      return () => Promise.resolve([]);
    }
    const value = (database as any)[prop];
    if (typeof value === 'function') {
      return value.bind(database);
    }
    return value;
  }
});
