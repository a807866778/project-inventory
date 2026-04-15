import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte, lt, like, or, isNull } from "drizzle-orm";
import * as schema from "./schema";

export { schema, eq, desc, and, gte, lt, like, or, isNull };

// 判断是否在 Cloudflare Workers 环境中
function isCloudflareWorkers(): boolean {
  return typeof globalThis !== "undefined" && 
         (typeof (globalThis as any).env?.DB !== "undefined" || 
          typeof (globalThis as any).__D1_DB__ !== "undefined");
}

// 创建 D1 client (Cloudflare Workers 运行时)
function createD1Client() {
  if (!isCloudflareWorkers()) return null;
  // @ts-ignore - D1 全局变量在 Workers 环境中可用
  const d1Database = globalThis.__D1_DB__ || (globalThis as any).env?.DB;
  if (!d1Database) return null;
  return d1Database;
}

let _db: ReturnType<typeof drizzle> | null = null;

// Turso client 仅在非 Cloudflare 环境使用，通过动态导入避免构建时打包问题
async function createTursoClient() {
  if (isCloudflareWorkers()) return null;
  
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url) {
    console.warn("DATABASE_URL not set");
    return null;
  }
  const { createClient } = await import("@libsql/client");
  return createClient({ url, authToken });
}

export async function initDb() {
  if (_db) return;
  
  // 优先使用 D1 (Cloudflare Workers)
  const d1 = createD1Client();
  if (d1) {
    _db = drizzle(d1, { schema });
    return;
  }

  // 非 Cloudflare 环境使用 Turso
  const client = await createTursoClient();
  if (client) {
    _db = drizzle(client, { schema });
  }
}

export function getDb() {
  return _db;
}

// Mock db for build time
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
    // 初始化数据库（异步）
    initDb();
    
    const database = getDb();
    if (!database) {
      return (mockDb as any)[prop];
    }
    const value = (database as any)[prop];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});
