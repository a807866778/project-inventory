import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Re-export schema tables for convenient imports
export { schema };

// Create D1 client for Cloudflare
function createD1Client() {
  return createClient({
    url: process.env.DATABASE_URL || "file:./data/project-inventory.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
}

const client = createD1Client();
export const db = drizzle(client, { schema });
