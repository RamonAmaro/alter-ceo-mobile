import path from "node:path";
import { defineConfig } from "vitest/config";

// Vitest é usado APENAS para utils puros (sem React Native, sem AsyncStorage, sem Platform).
// Não suporta JSX/TSX da app — testes de componentes precisariam de jest-expo.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/utils/**/*.test.ts", "src/lib/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
});
