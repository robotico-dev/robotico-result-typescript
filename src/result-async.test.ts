import { describe, it, expect } from "vitest";
import {
  success,
  error,
  successOf,
  errorOf,
  successTyped,
  isError,
  isSuccessOf,
  isErrorOf,
} from "./result.js";
import { createSimpleError } from "./errors.js";
import {
  mapVoidAsync,
  bindVoidAsync,
  mapAsync,
  bindAsync,
  mapErrorAsync,
  mapTypedAsync,
  bindTypedAsync,
  mapErrorTypedAsync,
} from "./result-async.js";

describe("result-async", () => {
  describe("mapVoidAsync", () => {
    it("ok maps with async", async () => {
      const r = await mapVoidAsync(success(), async () => 42);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(42);
    });
    it("err propagates", async () => {
      const err = createSimpleError("e");
      const r = await mapVoidAsync(error(err), async () => 0);
      expect(isErrorOf(r)).toBe(true);
    });
  });

  describe("bindVoidAsync", () => {
    it("ok binds with async", async () => {
      const r = await bindVoidAsync(success(), async () => successOf(1));
      expect(isSuccessOf(r)).toBe(true);
    });
    it("err propagates", async () => {
      const err = createSimpleError("e");
      const r = await bindVoidAsync(error(err), async () => successOf(0));
      expect(isError(r)).toBe(true);
    });
  });

  describe("mapAsync", () => {
    it("ok maps with async", async () => {
      const r = await mapAsync(successOf(1), async (x) => x + 1);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(2);
    });
    it("err propagates", async () => {
      const err = createSimpleError("e");
      const r = await mapAsync(errorOf<number>(err), async (x) => x);
      expect(isErrorOf(r)).toBe(true);
    });
  });

  describe("bindAsync", () => {
    it("ok binds with async", async () => {
      const r = await bindAsync(successOf(1), async (x) => successOf(x + 1));
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(2);
    });
    it("err propagates", async () => {
      const err = createSimpleError("e");
      const r = await bindAsync(errorOf<number>(err), async (x) =>
        successOf(x)
      );
      expect(isErrorOf(r)).toBe(true);
    });
  });

  describe("mapErrorAsync", () => {
    it("ok passes through", async () => {
      const r = await mapErrorAsync(successOf(1), async () =>
        createSimpleError("x")
      );
      expect(isSuccessOf(r)).toBe(true);
    });
    it("err maps error", async () => {
      const r = await mapErrorAsync(
        errorOf<number>(createSimpleError("a")),
        async (e) => createSimpleError(e.message + "!")
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("a!");
    });
  });

  describe("mapTypedAsync / bindTypedAsync / mapErrorTypedAsync", () => {
    it("mapTypedAsync ok maps", async () => {
      const r = await mapTypedAsync(successOf(1), async (x) => x + 1);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(2);
    });
    it("mapTypedAsync err propagates", async () => {
      const err = createSimpleError("e");
      const r = await mapTypedAsync(errorOf<number>(err), async (x) => x + 1);
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error).toBe(err);
    });
    it("bindTypedAsync ok binds", async () => {
      const r = await bindTypedAsync(successOf(1), async (x) =>
        successOf(x + 1)
      );
      expect(isSuccessOf(r)).toBe(true);
    });
    it("bindTypedAsync err propagates", async () => {
      const err = createSimpleError("e");
      const r = await bindTypedAsync(errorOf<number>(err), async () =>
        successOf(0)
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error).toBe(err);
    });
    it("mapErrorTypedAsync ok passes through", async () => {
      const r = await mapErrorTypedAsync(
        successTyped(7),
        async (e) => createSimpleError(e.message)
      );
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(7);
    });
    it("mapErrorTypedAsync err maps error", async () => {
      const r = await mapErrorTypedAsync(
        errorOf<number>(createSimpleError("e")),
        async (e) => createSimpleError(e.message + "!")
      );
      expect(isErrorOf(r)).toBe(true);
    });
  });
});
