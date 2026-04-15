import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

<<<<<<< HEAD
// 创建 Turso/本地 client
=======
// Create Turso client
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
function createTursoClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url) {
    console.warn("DATABASE_URL not set");
    return null;
  }
  return createClient({ url, authToken });
}

<<<<<<< HEAD
// 创建 D1 client (Cloudflare Workers 运行时)
function createD1Client() {
  // @ts-ignore - D1 全局变量在 Workers 环境中可用
  const d1Database = globalThis.__D1_DB__ || (globalThis as any).env?.DB;
  if (!d1Database) return null;
  return d1Database;
}

=======
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
<<<<<<< HEAD
    // 尝试 D1 (Cloudflare Workers)
    const d1 = createD1Client();
    if (d1) {
      _db = drizzle(d1, { schema });
      return _db;
    }

    // 尝试 Turso
=======
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
    const client = createTursoClient();
    if (client) {
      _db = drizzle(client, { schema });
    }
  }
  return _db;
}

<<<<<<< HEAD
// Mock db for build time
=======
// Mock db for build time (no DATABASE_URL)
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
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
<<<<<<< HEAD
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
=======
    if (typeof value === 'function') {
      return value.bind(database);
    }
    return value;
  }
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
});
