/**
 * ResultTyped functor and monad laws.
 */

import { describe, it, expect } from "vitest";
import { createSimpleError } from "./errors.js";
import { successTyped, errorTyped, mapTyped, bindTyped } from "./result.js";

type SimpleErr = ReturnType<typeof createSimpleError>;

const id = <T>(x: T): T => x;
const double = (n: number): number => n * 2;
const addOne = (n: number): number => n + 1;

describe("ResultTyped functor laws", () => {
  describe("identity", () => {
    it("mapTyped(r, id) preserves value for Ok", () => {
      const r = successTyped<number, SimpleErr>(42);
      const mapped = mapTyped(r, id);
      expect(mapped._tag).toBe("ok");
      if (mapped._tag === "ok" && r._tag === "ok") {
        expect(mapped.value).toBe(r.value);
      }
    });
    it("mapTyped(Err(e), id) propagates same error", () => {
      const err = createSimpleError("fail");
      const r = errorTyped<number, SimpleErr>(err);
      const mapped = mapTyped(r, id);
      expect(mapped._tag).toBe("err");
      if (mapped._tag === "err" && r._tag === "err") {
        expect(mapped.error).toBe(r.error);
      }
    });
  });

  describe("composition", () => {
    it("mapTyped(mapTyped(r, f), g) === mapTyped(r, x => g(f(x))) for Ok", () => {
      const r = successTyped<number, SimpleErr>(5);
      const composed = (x: number) => addOne(double(x));
      const left = mapTyped(mapTyped(r, double), addOne);
      const right = mapTyped(r, composed);
      expect(left._tag).toBe("ok");
      expect(right._tag).toBe("ok");
      if (left._tag === "ok" && right._tag === "ok") {
        expect(left.value).toBe(right.value);
        expect(left.value).toBe(11);
      }
    });
  });
});

describe("ResultTyped monad laws", () => {
  describe("left identity", () => {
    it("bindTyped(successTyped(v), successTyped) === successTyped(v)", () => {
      const v = 10;
      const r = bindTyped(successTyped<number, SimpleErr>(v), (x) =>
        successTyped<number, SimpleErr>(x)
      );
      expect(r._tag).toBe("ok");
      if (r._tag === "ok") expect(r.value).toBe(v);
    });
  });

  describe("left zero", () => {
    it("bindTyped(errorTyped(e), successTyped) propagates error", () => {
      const err = createSimpleError("x");
      const r = bindTyped(errorTyped<number, SimpleErr>(err), (x) =>
        successTyped<number, SimpleErr>(x)
      );
      expect(r._tag).toBe("err");
      if (r._tag === "err") expect(r.error).toBe(err);
    });
  });

  describe("right identity", () => {
    it("bindTyped(successTyped(v), x => successTyped(x)) === successTyped(v)", () => {
      const v = 7;
      const r = bindTyped(successTyped<number, SimpleErr>(v), (x) =>
        successTyped<number, SimpleErr>(x)
      );
      expect(r._tag).toBe("ok");
      if (r._tag === "ok") expect(r.value).toBe(v);
    });
  });

  describe("composition", () => {
    const f = (n: number) =>
      n > 0
        ? successTyped<number, SimpleErr>(n * 2)
        : errorTyped<number, SimpleErr>(createSimpleError("neg"));
    const g = (n: number) =>
      n % 2 === 0
        ? successTyped<number, SimpleErr>(n + 1)
        : errorTyped<number, SimpleErr>(createSimpleError("odd"));
    it("bindTyped(bindTyped(r, f), g) === bindTyped(r, x => bindTyped(f(x), g)) for Ok", () => {
      const r = successTyped<number, SimpleErr>(3);
      const left = bindTyped(bindTyped(r, f), g);
      const right = bindTyped(r, (x) => bindTyped(f(x), g));
      expect(left._tag).toBe(right._tag);
      if (left._tag === "ok" && right._tag === "ok") {
        expect(left.value).toBe(right.value);
      }
      if (left._tag === "err" && right._tag === "err") {
        expect(left.error.message).toBe(right.error.message);
      }
    });
  });
});
