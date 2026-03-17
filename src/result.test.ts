import { describe, it, expect } from "vitest";
import { createSimpleError } from "./errors.js";
import {
  success,
  error,
  successOf,
  errorOf,
  isSuccess,
  isError,
  isSuccessOf,
  isErrorOf,
  map,
  bind,
  mapVoid,
  bindVoid,
  mapError,
  getValue,
  expectSuccess,
  expectSuccessVoid,
  expectSuccessTyped,
  validationError,
  validationErrorVoid,
  successTyped,
  errorTyped,
  mapTyped,
  bindTyped,
  mapErrorTyped,
  fromVoidResult,
  fromVoidTyped,
  fromTypedToResult,
  fromWithIError,
  fromTypedWithIError,
} from "./result.js";

describe("ResultVoid", () => {
  it("success() returns ok", () => {
    const r = success();
    expect(r._tag).toBe("ok");
    expect(isSuccess(r)).toBe(true);
    expect(isError(r)).toBe(false);
  });
  it("error(err) returns err and is frozen", () => {
    const err = createSimpleError("fail");
    const r = error(err);
    expect(r._tag).toBe("err");
    expect(r.error).toBe(err);
    expect(isError(r)).toBe(true);
    expect(() => ((r as { error: unknown }).error = null)).toThrow();
  });
  it("error(null) throws", () => {
    expect(() => error(null!)).toThrow(/must not be null/);
  });
});

describe("Result<T>", () => {
  it("successOf(value) returns ok", () => {
    const r = successOf(42);
    expect(isSuccessOf(r)).toBe(true);
    if (isSuccessOf(r)) expect(r.value).toBe(42);
  });
  it("errorOf(err) returns err", () => {
    const err = createSimpleError("x");
    const r = errorOf<number>(err);
    expect(r._tag).toBe("err");
    expect(isErrorOf(r)).toBe(true);
  });
  it("map on ok maps value", () => {
    const r = map(successOf(1), (x) => x + 1);
    expect(isSuccessOf(r)).toBe(true);
    if (isSuccessOf(r)) expect(r.value).toBe(2);
  });
  it("map on err propagates error", () => {
    const err = createSimpleError("e");
    const r = map(errorOf<number>(err), (x) => x + 1);
    expect(isErrorOf(r)).toBe(true);
    if (isErrorOf(r)) expect(r.error.message).toBe("e");
  });
  it("bind on ok chains", () => {
    const r = bind(successOf(1), (x) => successOf(x + 1));
    expect(isSuccessOf(r)).toBe(true);
    if (isSuccessOf(r)) expect(r.value).toBe(2);
  });
  it("mapVoid on ok maps", () => {
    const r = mapVoid(success(), () => 42);
    expect(isSuccessOf(r)).toBe(true);
    if (isSuccessOf(r)) expect(r.value).toBe(42);
  });
  it("mapVoid on err propagates error", () => {
    const err = createSimpleError("e");
    const r = mapVoid(error(err), () => 42);
    expect(isErrorOf(r)).toBe(true);
    if (isErrorOf(r)) expect(r.error).toBe(err);
  });
  it("bindVoid on ok chains", () => {
    const r = bindVoid(success(), () => successOf(1));
    expect(isSuccessOf(r)).toBe(true);
    if (isSuccessOf(r)) expect(r.value).toBe(1);
  });
  it("bindVoid on err propagates error", () => {
    const err = createSimpleError("e");
    const r = bindVoid(error(err), () => successOf(0));
    expect(isErrorOf(r)).toBe(true);
    if (isErrorOf(r)) expect(r.error).toBe(err);
  });
  it("expectSuccess returns value for ok", () => {
    expect(expectSuccess(successOf(10))).toBe(10);
  });
  it("expectSuccess throws for err", () => {
    const err = createSimpleError("fail");
    expect(() => expectSuccess(errorOf<number>(err))).toThrow("fail");
  });
  it("expectSuccess uses exceptionBuilder when provided", () => {
    const err = createSimpleError("custom");
    expect(() =>
      expectSuccess(
        errorOf<number>(err),
        (e) => new Error("wrapped:" + e.message)
      )
    ).toThrow("wrapped:custom");
  });
  it("expectSuccessVoid throws for err", () => {
    const err = createSimpleError("v");
    expect(() => expectSuccessVoid(error(err))).toThrow("v");
  });
  it("expectSuccessVoid uses exceptionBuilder when provided", () => {
    const err = createSimpleError("v");
    expect(() =>
      expectSuccessVoid(error(err), (e) => new Error("wrapped:" + e.message))
    ).toThrow("wrapped:v");
  });
});

describe("validationError", () => {
  it("validationError returns err", () => {
    const r = validationError({ field: ["required"] });
    expect(isErrorOf(r)).toBe(true);
    if (isErrorOf(r)) expect(r.error.code).toBe("VAL_FAILED");
  });
  it("validationErrorVoid returns err", () => {
    const r = validationErrorVoid({ x: ["invalid"] });
    expect(r._tag).toBe("err");
  });
});

describe("mapError", () => {
  it("mapError passes through ok", () => {
    const r = successOf(1);
    const r2 = mapError(r, (e) => createSimpleError(e.message + "!"));
    expect(isSuccessOf(r2)).toBe(true);
    if (isSuccessOf(r2)) expect(r2.value).toBe(1);
  });
  it("mapError transforms error", () => {
    const r = errorOf<number>(createSimpleError("a"));
    const r2 = mapError(r, (e) => createSimpleError(e.message + "!"));
    expect(isErrorOf(r2)).toBe(true);
    if (isErrorOf(r2)) expect(r2.error.message).toBe("a!");
  });
});

describe("getValue", () => {
  it("returns value when ok", () => {
    expect(getValue(successOf(42))).toBe(42);
  });
  it("returns undefined when err", () => {
    expect(getValue(errorOf<number>(createSimpleError("x")))).toBeUndefined();
  });
});

describe("ResultTyped conversions and helpers", () => {
  it("fromWithIError ok", () => {
    const r = fromWithIError(successOf(1));
    expect(r._tag).toBe("ok");
    if (r._tag === "ok") expect(r.value).toBe(1);
  });
  it("fromWithIError err", () => {
    const err = createSimpleError("e");
    const r = fromWithIError(errorOf<number>(err));
    expect(r._tag).toBe("err");
    if (r._tag === "err") expect(r.error).toBe(err);
  });
  it("fromTypedWithIError ok", () => {
    const r = fromTypedWithIError(
      successTyped<number, ReturnType<typeof createSimpleError>>(1)
    );
    expect(r._tag).toBe("ok");
    if (r._tag === "ok") expect(r.value).toBe(1);
  });
  it("fromTypedWithIError err", () => {
    const err = createSimpleError("e");
    const r = fromTypedWithIError(
      errorTyped<number, ReturnType<typeof createSimpleError>>(err)
    );
    expect(r._tag).toBe("err");
    if (r._tag === "err") expect(r.error).toBe(err);
  });
  it("fromVoidResult and fromVoidTyped", () => {
    expect(fromVoidResult(successOf(1))._tag).toBe("ok");
    expect(fromVoidResult(errorOf<number>(createSimpleError("x")))._tag).toBe(
      "err"
    );
    expect(fromVoidTyped(successTyped(1))._tag).toBe("ok");
  });
  it("fromTypedToResult preserves ok/err", () => {
    const ok = fromTypedToResult(successTyped(2));
    expect(ok._tag).toBe("ok");
    if (ok._tag === "ok") expect(ok.value).toBe(2);
    const err = fromTypedToResult(errorTyped<number>(createSimpleError("y")));
    expect(err._tag).toBe("err");
  });
  it("expectSuccessTyped returns value when ok", () => {
    expect(expectSuccessTyped(successTyped(10))).toBe(10);
  });
  it("expectSuccessTyped throws when err", () => {
    expect(() =>
      expectSuccessTyped(errorTyped<number>(createSimpleError("z")))
    ).toThrow("z");
  });
  it("expectSuccessTyped uses exceptionBuilder when provided", () => {
    expect(() =>
      expectSuccessTyped(
        errorTyped<number>(createSimpleError("z")),
        (e) => new Error("typed:" + e.message)
      )
    ).toThrow("typed:z");
  });
});

describe("ResultTyped map/bind/mapError", () => {
  it("mapTyped maps value", () => {
    const r = mapTyped(successTyped(1), (x) => x + 1);
    expect(r._tag).toBe("ok");
    if (r._tag === "ok") expect(r.value).toBe(2);
  });
  it("mapTyped propagates err", () => {
    const err = createSimpleError("e");
    const r = mapTyped(errorTyped<number>(err), (x: number) => x + 1);
    expect(r._tag).toBe("err");
    if (r._tag === "err") expect(r.error).toBe(err);
  });
  it("bindTyped chains", () => {
    const r = bindTyped(successTyped(1), (x) => successTyped(x + 1));
    expect(r._tag).toBe("ok");
    if (r._tag === "ok") expect(r.value).toBe(2);
  });
  it("mapErrorTyped maps error", () => {
    const r = mapErrorTyped(errorTyped<number>(createSimpleError("a")), (e) =>
      createSimpleError(e.message + "!")
    );
    expect(r._tag).toBe("err");
    if (r._tag === "err") expect(r.error.message).toBe("a!");
  });
  it("mapErrorTyped passes through ok", () => {
    const r = mapErrorTyped(successTyped(1), (e) =>
      createSimpleError(e.message + "!")
    );
    expect(r._tag).toBe("ok");
    if (r._tag === "ok") expect(r.value).toBe(1);
  });
});
