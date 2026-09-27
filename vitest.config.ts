import { defineConfig } from "vitest/config";
import path from "node:path";

// Alias @/* → ./* (tsconfig paths) para que los tests resuelvan los mismos
// imports que usa la app de Next (ej. @/lib/supabase/client).
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
