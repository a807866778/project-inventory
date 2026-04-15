import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

let _db: ReturnType<typeof drizzle> | null = null;

function createD1Client() {
  const url = process.env.DATABASE_URL || process.env.CF_DATABASE_URL;
  if (!url) return null;
  return createClient({ url });
}

export function getDb() {
  if (!_db) {
    const client = createD1Client();
    if (client) {
      _db = drizzle(client, { schema });
    }
  }
  return _db;
}

// Mock db for build time (no DATABASE_URL)
const mockDb = {
  select: () => ({ from: () => ({ where: () => ({ get: () => null, all: () => [] }) }) }),
  insert: () => ({ values: () => Promise.resolve({}) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve({}) }) }),
  delete: () => ({ where: () => Promise.resolve({}) }),
  query: { materials: { findFirst: () => null, findMany: () => [] }, projects: { findFirst: () => null }, categories: { findFirst: () => null }, suppliers: { findFirst: () => null }, users: { findFirst: () => null }, roles: { findFirst: () => null }, inboundRecords: { findFirst: () => null }, outboundRecords: { findFirst: () => null }, inboundItems: { findFirst: () => null }, outboundItems: { findFirst: () => null } },
  $count: () => Promise.resolve(0),
};

export const db: ReturnType<typeof drizzle> = new Proxy({} as any, {
  get(_, prop) {
    const database = getDb();
    if (!database) {
      return (mockDb as any)[prop];
    }
    const value = (database as any)[prop];
    if (typeof value === 'function') {
      return value.bind(database);
    }
    return value;
  }
});
