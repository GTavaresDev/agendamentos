import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["core/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@core": path.resolve(import.meta.dirname, "core"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
