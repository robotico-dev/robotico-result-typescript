import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.laws.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "**/index.ts"],
      thresholds: { branches: 90, functions: 90, lines: 90, statements: 90 },
    },
  },
});
