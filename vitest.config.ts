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
      exclude: [
        "src/**/*.test.ts",
        "**/index.ts",
        "**/result.ts",
        "**/errors.ts",
        "**/aggregate-error-type.ts",
        "**/error-base.ts",
        "**/exception-error.ts",
        "**/i-error.ts",
        "**/simple-error.ts",
        "**/validation-error.ts",
      ],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
});
