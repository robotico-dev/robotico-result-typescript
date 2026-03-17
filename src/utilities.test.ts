import { describe, it, expect } from "vitest";
import { successOf, errorOf, isSuccessOf, isErrorOf } from "./result.js";
import { createSimpleError } from "./errors.js";
import {
  combine,
  combine2,
  combine3,
  combine4,
  tryResult,
  tryAsync,
  tryVoid,
  tryVoidAsync,
} from "./utilities.js";

describe("utilities", () => {
  describe("combine", () => {
    it("collects all ok into array", () => {
      const r = combine([successOf(1), successOf(2), successOf(3)]);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toEqual([1, 2, 3]);
    });
    it("first error wins", () => {
      const err = createSimpleError("e1");
      const r = combine([successOf(1), errorOf<number>(err), successOf(3)]);
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("e1");
    });
  });

  describe("combine2", () => {
    it("both ok returns tuple", () => {
      const r = combine2(successOf(1), successOf("a"));
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toEqual([1, "a"]);
    });
    it("one err returns aggregated error", () => {
      const e = createSimpleError("x");
      const r = combine2(successOf(1), errorOf<string>(e));
      expect(r._tag).toBe("err");
    });
    it("two err returns aggregated error", () => {
      const e1 = createSimpleError("a");
      const e2 = createSimpleError("b");
      const r = combine2(errorOf<number>(e1), errorOf<string>(e2));
      expect(r._tag).toBe("err");
      if (r._tag === "err")
        expect(r.error.message).toContain("Multiple errors");
    });
  });

  describe("combine3 / combine4", () => {
    it("combine3 all ok returns tuple", () => {
      const r = combine3(successOf(1), successOf("a"), successOf(true));
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toEqual([1, "a", true]);
    });
    it("combine3 one err returns err", () => {
      const r = combine3(
        successOf(1),
        errorOf<string>(createSimpleError("e")),
        successOf(3)
      );
      expect(r._tag).toBe("err");
    });
    it("combine4 all ok returns tuple", () => {
      const r = combine4(
        successOf(1),
        successOf(2),
        successOf(3),
        successOf(4)
      );
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toEqual([1, 2, 3, 4]);
    });
    it("combine4 one err returns err", () => {
      const r = combine4(
        successOf(1),
        successOf(2),
        errorOf<number>(createSimpleError("e")),
        successOf(4)
      );
      expect(r._tag).toBe("err");
    });
  });

  describe("tryResult", () => {
    it("success returns ok", () => {
      const r = tryResult(() => 42);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(42);
    });
    it("exception returns err", () => {
      const r = tryResult(() => {
        throw new Error("boom");
      });
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("boom");
    });
    it("uses errorFactory when provided", () => {
      const r = tryResult(
        () => {
          throw new Error("boom");
        },
        (ex) =>
          createSimpleError(
            "wrapped:" + (ex instanceof Error ? ex.message : "")
          )
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("wrapped:boom");
    });
  });

  describe("tryAsync", () => {
    it("success returns ok", async () => {
      const r = await tryAsync(async () => 1);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(1);
    });
    it("rejection returns err", async () => {
      const r = await tryAsync(() => Promise.reject(new Error("rej")));
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("rej");
    });
    it("uses errorFactory when provided", async () => {
      const r = await tryAsync(
        () => Promise.reject(new Error("x")),
        (ex) =>
          createSimpleError("custom:" + (ex instanceof Error ? ex.message : ""))
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("custom:x");
    });
  });

  describe("tryVoid", () => {
    it("success returns ok", () => {
      const r = tryVoid(() => {});
      expect(r._tag).toBe("ok");
    });
    it("exception returns err", () => {
      const r = tryVoid(() => {
        throw new Error("v");
      });
      expect(r._tag).toBe("err");
    });
    it("uses errorFactory when provided", () => {
      const r = tryVoid(
        () => {
          throw new Error("v");
        },
        (ex) =>
          createSimpleError(
            "wrapped:" + (ex instanceof Error ? ex.message : "")
          )
      );
      expect(r._tag).toBe("err");
      if (r._tag === "err") expect(r.error.message).toBe("wrapped:v");
    });
  });

  describe("tryVoidAsync", () => {
    it("success returns ok", async () => {
      const r = await tryVoidAsync(async () => {});
      expect(r._tag).toBe("ok");
    });
    it("rejection returns err", async () => {
      const r = await tryVoidAsync(() => Promise.reject(new Error("async")));
      expect(r._tag).toBe("err");
      if (r._tag === "err") expect(r.error.message).toBe("async");
    });
    it("uses errorFactory when provided", async () => {
      const r = await tryVoidAsync(
        () => Promise.reject(new Error("a")),
        (ex) =>
          createSimpleError("f:" + (ex instanceof Error ? ex.message : ""))
      );
      expect(r._tag).toBe("err");
      if (r._tag === "err") expect(r.error.message).toBe("f:a");
    });
  });
});
