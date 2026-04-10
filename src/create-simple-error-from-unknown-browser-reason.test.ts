import { describe, expect, it } from "vitest";

import { createSimpleErrorFromUnknownBrowserReason } from "./create-simple-error-from-unknown-browser-reason.js";

describe("createSimpleErrorFromUnknownBrowserReason", () => {
  it("maps DOMException with context and inner", () => {
    const ex = new DOMException("constraint", "ConstraintError");
    const err = createSimpleErrorFromUnknownBrowserReason(
      ex,
      "OUTER",
      "fallback"
    );
    expect(err.code).toBe("OUTER");
    expect(err.message).toBe("constraint");
    expect(err.innerError).not.toBeNull();
    expect(err.context.domExceptionName).toBe("ConstraintError");
  });

  it("maps generic Error to inner", () => {
    const err = createSimpleErrorFromUnknownBrowserReason(
      new Error("boom"),
      "OUTER",
      "fallback"
    );
    expect(err.code).toBe("OUTER");
    expect(err.message).toBe("boom");
    expect(err.innerError).not.toBeNull();
  });

  it("uses default message for non-Error reason", () => {
    const err = createSimpleErrorFromUnknownBrowserReason(
      "",
      "OUTER",
      "fallback"
    );
    expect(err.message).toBe("fallback");
    expect(err.innerError).toBeNull();
  });

  it("DOMException inner uses name when message is empty", () => {
    const ex = new DOMException("", "NotFoundError");
    const err = createSimpleErrorFromUnknownBrowserReason(
      ex,
      "OUTER",
      "fallback"
    );
    expect(err.innerError?.message).toBe("NotFoundError");
  });

  it("Error inner uses defaults when message and name are empty", () => {
    const ex = new Error("");
    ex.name = "";
    const err = createSimpleErrorFromUnknownBrowserReason(
      ex,
      "OUTER",
      "fallback"
    );
    expect(err.innerError?.message).toBe("Error");
    expect(err.innerError?.code).toBe("Error");
  });
});
