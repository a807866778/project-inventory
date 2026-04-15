import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export { schema };

// Lazy initialization
let _db = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL not set, database operations will be skipped");
    return null;
  }
  const client = createClient({ 
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN 
  });
  return drizzle(client, { schema });
}

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Default export - returns null if no database connection
export const db = {
  select: (...args) => getDb()?.select(...args) ?? Promise.resolve([]),
  insert: (...args) => getDb()?.insert(...args) ?? Promise.resolve({}),
  update: (...args) => getDb()?.update(...args) ?? Promise.resolve({}),
  delete: (...args) => getDb()?.delete(...args) ?? Promise.resolve({}),
};
