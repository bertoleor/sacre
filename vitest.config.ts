import { defineConfig } from "vitest/config";
import path from "node:path";

// Alias @/ → project root, matching tsconfig.json paths so route tests can
// import the app's modules the same way Next.js resolves them at runtime.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
});
