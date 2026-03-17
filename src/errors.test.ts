import { describe, it, expect } from "vitest";
import {
  ErrorSeverity,
  createSimpleError,
  simpleError,
  createValidationError,
  validationErrorForField,
  createExceptionError,
  createError,
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
  });

  describe("createError / createAggregateError", () => {
    it("createError with causedBy", () => {
      const c = simpleError("cause");
      const e = createError("top", [c]);
      expect(e.causedBy).toHaveLength(1);
      expect(e.innerError).toBe(c);
    });
    it("aggregateError combines multiple", () => {
      const errs = [simpleError("a"), simpleError("b")];
      const e = aggregateError(errs);
      expect(e.errors).toHaveLength(2);
    });
  });
});
