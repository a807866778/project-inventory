import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

// Create Turso client
function createTursoClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url) {
    console.warn("DATABASE_URL not set");
    return null;
  }
  return createClient({ url, authToken });
}

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const client = createTursoClient();
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
