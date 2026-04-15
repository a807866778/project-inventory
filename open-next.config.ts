import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare",
      converter: "edge",
      incrementalCache: "cloudflare-kv",
      tagCache: "cloudflare-kv",
      queue: "cloudflare-queue",
    },
  },
};

export default config;
