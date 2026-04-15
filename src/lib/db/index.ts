import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

// Create D1 client for Cloudflare Pages
function createD1Client() {
  // Cloudflare D1 binding - DB is the binding name in wrangler.toml
  const url = process.env.DATABASE_URL || process.env.CF_DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL not set, database operations will return empty results");
    return null;
  }
  return createClient({ url });
}

let _db: ReturnType<typeof drizzle> | null = null;

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
  select: () => ({ from: () => ({ where: () => ({ get: () => null, all: () => [] }) }),
  insert: () => ({ values: () => Promise.resolve({}) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve({}) }) }),
  delete: () => ({ where: () => Promise.resolve({}) }),
  query: { materials: { findFirst: () => Promise.resolve(null), findMany: () => Promise.resolve([]) }, projects: { findFirst: () => Promise.resolve(null) }, categories: { findFirst: () => Promise.resolve(null) } },
  $count: () => Promise.resolve(0),
};

export const db = new Proxy({} as any, {
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
