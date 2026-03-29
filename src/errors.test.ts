import { describe, it, expect } from "vitest";
import {
  ErrorSeverity,
  createSimpleError,
  simpleError,
  createValidationError,
  validationErrorForField,
  createExceptionError,
  createError,
  createAggregateError,
  aggregateError,
} from "./errors.js";

describe("errors", () => {
  describe("createSimpleError / simpleError", () => {
    it("creates error with message", () => {
      const e = simpleError("msg");
      expect(e.message).toBe("msg");
      expect(e.code).toBe("ERROR");
      expect(e.severity).toBe(ErrorSeverity.Error);
    });
    it("createSimpleError with defaults", () => {
      const e = createSimpleError("m", "C", ErrorSeverity.Warning);
      expect(e.message).toBe("m");
      expect(e.code).toBe("C");
      expect(e.severity).toBe(ErrorSeverity.Warning);
    });
    it("createSimpleError with non-empty context freezes context", () => {
      const ctx = { key: "value" };
      const e = createSimpleError("m", "C", ErrorSeverity.Error, null, ctx);
      expect(e.context).toEqual({ key: "value" });
      expect(Object.isFrozen(e.context)).toBe(true);
    });
  });

  describe("createValidationError", () => {
    it("requires at least one error", () => {
      expect(() => createValidationError({})).toThrow(/At least one/);
    });
    it("returns frozen validation error", () => {
      const e = createValidationError({ f: ["required"] });
      expect(e.errors).toEqual({ f: ["required"] });
      expect(e.code).toBe("VAL_FAILED");
    });
  });

  describe("validationErrorForField", () => {
    it("creates single-field validation error", () => {
      const e = validationErrorForField("email", "invalid");
      expect(e.errors).toEqual({ email: ["invalid"] });
    });
  });

  describe("createExceptionError", () => {
    it("wraps Error", () => {
      const ex = new Error("boom");
      const e = createExceptionError(ex);
      expect(e.message).toBe("boom");
      expect(e.exception).toBe(ex);
    });
    it("wraps non-Error as string message", () => {
      const e = createExceptionError("plain");
      expect(e.message).toBe("plain");
      expect(e.exception).toBe("plain");
    });
    it("uses default message when Error message is undefined", () => {
      const ex = new Error();
      Object.defineProperty(ex, "message", {
        value: undefined,
        configurable: true,
      });
      const e = createExceptionError(ex);
      expect(e.message).toBe("An exception occurred");
    });
  });

  describe("createError / createAggregateError", () => {
    it("createError with causedBy", () => {
      const c = simpleError("cause");
      const e = createError("top", [c]);
      expect(e.causedBy).toHaveLength(1);
      expect(e.innerError).toBe(c);
    });
    it("createError with empty causedBy has null innerError", () => {
      const e = createError("top", []);
      expect(e.causedBy).toHaveLength(0);
      expect(e.innerError).toBeNull();
    });
    it("createError with null causedBy", () => {
      const e = createError("top", null);
      expect(e.innerError).toBeNull();
    });
    it("createAggregateError with empty errors has null innerError", () => {
      const e = createAggregateError("none", []);
      expect(e.errors).toHaveLength(0);
      expect(e.innerError).toBeNull();
    });
    it("aggregateError combines multiple", () => {
      const errs = [simpleError("a"), simpleError("b")];
      const e = aggregateError(errs);
      expect(e.errors).toHaveLength(2);
    });
  });
});
