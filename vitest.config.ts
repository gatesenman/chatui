import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: { alias: { "@agent/chat-ui": resolve(__dirname, "src/index.ts") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
