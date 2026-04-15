<<<<<<< HEAD
import type { Config } from "drizzle-kit";

export default {
=======
import { defineConfig } from "drizzle-kit";

export default defineConfig({
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
<<<<<<< HEAD
    url: process.env.DATABASE_URL || "./data/project-inventory.db",
  },
} satisfies Config;
=======
    url: "./data/project-inventory.db",
  },
});
>>>>>>> 4a2ceed9022514aef389900d5c5e43d17abce0da
