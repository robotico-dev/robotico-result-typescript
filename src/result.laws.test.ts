/**
 * Result functor and monad laws for Result<T>.
 */

import { describe, it, expect } from "vitest";
import { createSimpleError } from "./errors.js";
import {
  successOf,
  errorOf,
  map,
  bind,
  isSuccessOf,
  isErrorOf,
} from "./result.js";

const id = <T>(x: T): T => x;
const double = (n: number): number => n * 2;
const addOne = (n: number): number => n + 1;

describe("Result functor laws", () => {
  describe("identity", () => {
    it("map(r, id) === r for Ok", () => {
      const r = successOf(42);
      const mapped = map(r, id);
      expect(isSuccessOf(mapped)).toBe(true);
      if (isSuccessOf(mapped) && isSuccessOf(r)) {
        expect(mapped.value).toBe(r.value);
      }
    });
    it("map(Err(e), id) propagates same error", () => {
      const err = createSimpleError("fail");
      const r = errorOf<number>(err);
      const mapped = map(r, id);
      expect(isErrorOf(mapped)).toBe(true);
      if (isErrorOf(mapped) && isErrorOf(r)) {
        expect(mapped.error).toBe(r.error);
      }
    });
  });

  describe("composition", () => {
    it("map(map(r, f), g) === map(r, x => g(f(x))) for Ok", () => {
      const r = successOf(5);
      const composed = (x: number) => addOne(double(x));
      const left = map(map(r, double), addOne);
      const right = map(r, composed);
      expect(isSuccessOf(left)).toBe(true);
      expect(isSuccessOf(right)).toBe(true);
      if (isSuccessOf(left) && isSuccessOf(right)) {
        expect(left.value).toBe(right.value);
        expect(left.value).toBe(11);
      }
    });
    it("map(map(Err(e), f), g) propagates same error", () => {
      const err = createSimpleError("e");
      const r = errorOf<number>(err);
      const left = map(map(r, double), addOne);
      expect(isErrorOf(left)).toBe(true);
      if (isErrorOf(left)) expect(left.error).toBe(err);
    });
  });
});

describe("Result monad laws", () => {
  describe("left identity", () => {
    it("bind(successOf(v), successOf) === successOf(v)", () => {
      const v = 10;
      const r = bind(successOf(v), successOf);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(v);
    });
  });

  describe("left zero", () => {
    it("bind(errorOf(e), successOf) propagates error", () => {
      const err = createSimpleError("x");
      const r = bind(errorOf<number>(err), successOf);
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error).toBe(err);
    });
  });

  describe("right identity", () => {
    it("bind(successOf(v), x => successOf(x)) === successOf(v)", () => {
      const v = 7;
      const r = bind(successOf(v), (x) => successOf(x));
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(v);
    });
  });

  describe("composition", () => {
    const f = (n: number) =>
      n > 0 ? successOf(n * 2) : errorOf(createSimpleError("neg"));
    const g = (n: number) =>
      n % 2 === 0 ? successOf(n + 1) : errorOf(createSimpleError("odd"));
    it("bind(bind(r, f), g) === bind(r, x => bind(f(x), g)) for Ok", () => {
      const r = successOf(3);
      const left = bind(bind(r, f), g);
      const right = bind(r, (x) => bind(f(x), g));
      expect(isSuccessOf(left)).toBe(isSuccessOf(right));
      if (isSuccessOf(left) && isSuccessOf(right)) {
        expect(left.value).toBe(right.value);
      }
      if (isErrorOf(left) && isErrorOf(right)) {
        expect(left.error.message).toBe(right.error.message);
      }
    });
    it("bind(errorOf(e), f) then bind(_, g) propagates error", () => {
      const err = createSimpleError("e");
      const r = errorOf<number>(err);
      const left = bind(bind(r, f), g);
      expect(isErrorOf(left)).toBe(true);
      if (isErrorOf(left)) expect(left.error).toBe(err);
    });
  });
});
