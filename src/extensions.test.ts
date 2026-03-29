import { describe, it, expect, vi } from "vitest";
import { successOf, errorOf, isSuccessOf, isErrorOf } from "./result.js";
import { createSimpleError } from "./errors.js";
import {
  match,
  matchVoid,
  matchVoidVoid,
  matchTyped,
  tap,
  tapVoid,
  tapError,
  tapErrorVoid,
  tapTyped,
  tapErrorTyped,
  recover,
  recoverWith,
  recoverWithResult,
  recoverTyped,
  recoverWithVoid,
  ensure,
  ensureMessage,
  collect,
  sequence,
  chooseSuccessful,
  getValueOrDefault,
  mapErrorResult,
  matchVoidResult,
  recoverWithTyped,
  recoverWithResultTyped,
} from "./extensions.js";
import { success, error, successTyped, errorTyped } from "./result.js";

describe("extensions", () => {
  describe("match", () => {
    it("ok runs onSuccess", () => {
      expect(
        match(
          successOf(1),
          (x) => x + 1,
          () => 0
        )
      ).toBe(2);
    });
    it("err runs onError", () => {
      const err = createSimpleError("e");
      expect(
        match(
          errorOf<number>(err),
          (x) => x,
          (e) => e.message
        )
      ).toBe("e");
    });
  });

  describe("tap / tapError", () => {
    it("tap runs on ok", () => {
      const fn = vi.fn();
      tap(successOf(1), fn);
      expect(fn).toHaveBeenCalledWith(1);
    });
    it("tap skips on err", () => {
      const fn = vi.fn();
      const err = createSimpleError("e");
      tap(errorOf<number>(err), fn);
      expect(fn).not.toHaveBeenCalled();
    });
    it("tapError runs on err", () => {
      const err = createSimpleError("x");
      const fn = vi.fn();
      tapError(errorOf<number>(err), fn);
      expect(fn).toHaveBeenCalledWith(err);
    });
    it("tapError skips on ok", () => {
      const fn = vi.fn();
      tapError(successOf(1), fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("recoverWith", () => {
    it("ok returns self", () => {
      const r = successOf(1);
      expect(recoverWith(r, 2)).toBe(r);
    });
    it("err returns success with fallback", () => {
      const r = recoverWith(errorOf<number>(createSimpleError("e")), 99);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(99);
    });
  });

  describe("recover", () => {
    it("ok returns self", () => {
      const r = successOf(1);
      expect(recover(r, () => 0)).toBe(r);
    });
    it("err returns Ok(fallback(error))", () => {
      const err = createSimpleError("e");
      const r = recover(errorOf<number>(err), (e) => e.message.length);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toBe(1);
    });
  });

  describe("recoverWithResult", () => {
    it("ok returns self", () => {
      const r = successOf(1);
      const fallback = successOf(2);
      expect(recoverWithResult(r, fallback)).toBe(r);
    });
    it("err returns fallback result", () => {
      const fallback = successOf(99);
      const r = recoverWithResult(
        errorOf<number>(createSimpleError("e")),
        fallback
      );
      expect(r).toBe(fallback);
      if (isSuccessOf(r)) expect(r.value).toBe(99);
    });
  });

  describe("ensure", () => {
    it("ok and predicate true returns self", () => {
      const r = successOf(2);
      expect(
        ensure(
          r,
          (x) => x > 0,
          () => createSimpleError("bad")
        )
      ).toBe(r);
    });
    it("ok and predicate false returns error", () => {
      const r = ensure(
        successOf(0),
        (x) => x > 0,
        () => createSimpleError("zero")
      );
      expect(r._tag).toBe("err");
    });
    it("err passes through unchanged", () => {
      const err = createSimpleError("e");
      const rIn = errorOf<number>(err);
      const r = ensure(
        rIn,
        () => true,
        () => createSimpleError("other")
      );
      expect(r).toBe(rIn);
    });
  });

  describe("ensureMessage", () => {
    it("uses simpleError with message", () => {
      const r = ensureMessage(
        successOf(-1),
        (x) => x >= 0,
        "must be non-negative"
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("must be non-negative");
    });
  });

  describe("collect / sequence", () => {
    it("collect returns array of values", () => {
      const r = collect([successOf(1), successOf(2)]);
      expect(isSuccessOf(r)).toBe(true);
      if (isSuccessOf(r)) expect(r.value).toEqual([1, 2]);
    });
    it("sequence is alias of collect", () => {
      const results = [successOf(1), successOf(2)];
      expect(sequence(results)).toEqual(collect(results));
    });
  });

  describe("chooseSuccessful", () => {
    it("yields only ok values", () => {
      const err = createSimpleError("e");
      const arr = [
        ...chooseSuccessful([successOf(1), errorOf<number>(err), successOf(3)]),
      ];
      expect(arr).toEqual([1, 3]);
    });
  });

  describe("void Result extensions", () => {
    it("matchVoid runs onSuccess when ok", () => {
      expect(
        matchVoid(
          success(),
          () => 1,
          () => 0
        )
      ).toBe(1);
    });
    it("matchVoid runs onError when err", () => {
      const err = createSimpleError("e");
      expect(
        matchVoid(
          error(err),
          () => 1,
          (e) => e.message
        )
      ).toBe("e");
    });
    it("matchVoidVoid runs both branches", () => {
      const okFn = vi.fn();
      const errFn = vi.fn();
      matchVoidVoid(success(), okFn, errFn);
      expect(okFn).toHaveBeenCalled();
      expect(errFn).not.toHaveBeenCalled();
      matchVoidVoid(error(createSimpleError("x")), okFn, errFn);
      expect(errFn).toHaveBeenCalledWith(
        expect.objectContaining({ message: "x" })
      );
    });
    it("tapVoid runs action when ok", () => {
      const fn = vi.fn();
      tapVoid(success(), fn);
      expect(fn).toHaveBeenCalled();
    });
    it("tapVoid skips action when err", () => {
      const fn = vi.fn();
      tapVoid(error(createSimpleError("x")), fn);
      expect(fn).not.toHaveBeenCalled();
    });
    it("tapErrorVoid runs action when err", () => {
      const err = createSimpleError("e");
      const fn = vi.fn();
      tapErrorVoid(error(err), fn);
      expect(fn).toHaveBeenCalledWith(err);
    });
    it("tapErrorVoid skips when ok", () => {
      const fn = vi.fn();
      tapErrorVoid(success(), fn);
      expect(fn).not.toHaveBeenCalled();
    });
    it("recoverWithVoid returns self when ok", () => {
      const r = success();
      expect(recoverWithVoid(r, error(createSimpleError("x")))).toBe(r);
    });
    it("recoverWithVoid returns fallback when err", () => {
      const fallback = success();
      const r = recoverWithVoid(error(createSimpleError("e")), fallback);
      expect(r).toBe(fallback);
    });
    it("matchVoidResult calls onSuccess when ok", () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      matchVoidResult(successOf(1), onSuccess, onError);
      expect(onSuccess).toHaveBeenCalledWith(1);
      expect(onError).not.toHaveBeenCalled();
    });
    it("matchVoidResult calls onError when err", () => {
      const err = createSimpleError("e");
      const onSuccess = vi.fn();
      const onError = vi.fn();
      matchVoidResult(errorOf<number>(err), onSuccess, onError);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(err);
    });
  });

  describe("getValueOrDefault", () => {
    it("returns value when ok", () => {
      expect(getValueOrDefault(successOf(42))).toBe(42);
    });
    it("returns undefined when err", () => {
      expect(
        getValueOrDefault(errorOf<number>(createSimpleError("x")))
      ).toBeUndefined();
    });
  });

  describe("mapErrorResult", () => {
    it("passes through ok", () => {
      const r = successOf(1);
      expect(mapErrorResult(r, (e) => createSimpleError(e.message + "!"))).toBe(
        r
      );
    });
    it("maps error when err", () => {
      const r = mapErrorResult(errorOf<number>(createSimpleError("a")), (e) =>
        createSimpleError(e.message + "!")
      );
      expect(isErrorOf(r)).toBe(true);
      if (isErrorOf(r)) expect(r.error.message).toBe("a!");
    });
  });

  describe("ResultTyped extensions", () => {
    it("matchTyped runs onSuccess when ok", () => {
      expect(
        matchTyped(
          successTyped(42),
          (x) => x + 1,
          () => 0
        )
      ).toBe(43);
    });
    it("matchTyped runs onError when err", () => {
      const err = createSimpleError("e");
      expect(
        matchTyped(
          errorTyped<number>(err),
          () => 0,
          (e) => e.message
        )
      ).toBe("e");
    });
    it("tapTyped runs action when ok", () => {
      const fn = vi.fn();
      tapTyped(successTyped(1), fn);
      expect(fn).toHaveBeenCalledWith(1);
    });
    it("tapTyped skips when err", () => {
      const fn = vi.fn();
      tapTyped(errorTyped<number>(createSimpleError("e")), fn);
      expect(fn).not.toHaveBeenCalled();
    });
    it("tapErrorTyped runs action when err", () => {
      const err = createSimpleError("x");
      const fn = vi.fn();
      tapErrorTyped(errorTyped<number>(err), fn);
      expect(fn).toHaveBeenCalledWith(err);
    });
    it("tapErrorTyped skips when ok", () => {
      const fn = vi.fn();
      tapErrorTyped(successTyped(1), fn);
      expect(fn).not.toHaveBeenCalled();
    });
    it("recoverTyped returns self when ok", () => {
      const r = successTyped(1);
      expect(recoverTyped(r, () => 0)).toBe(r);
    });
    it("recoverTyped returns Ok(fallback(error)) when err", () => {
      const err = createSimpleError("e");
      const r = recoverTyped(errorTyped<number>(err), (e) => e.message.length);
      expect(r._tag).toBe("ok");
      if (r._tag === "ok") expect(r.value).toBe(1);
    });
    it("recoverWithTyped returns self when ok", () => {
      const r = successTyped(1);
      expect(recoverWithTyped(r, 0)).toBe(r);
    });
    it("recoverWithTyped returns Ok(fallback) when err", () => {
      const r = recoverWithTyped(
        errorTyped<number>(createSimpleError("e")),
        99
      );
      expect(r._tag).toBe("ok");
      if (r._tag === "ok") expect(r.value).toBe(99);
    });
    it("recoverWithResultTyped returns self when ok", () => {
      const r = successTyped(1);
      expect(recoverWithResultTyped(r, successTyped(0))).toBe(r);
    });
    it("recoverWithResultTyped returns fallback when err", () => {
      const fallback = successTyped(2);
      const r = recoverWithResultTyped(
        errorTyped<number>(createSimpleError("e")),
        fallback
      );
      expect(r).toBe(fallback);
    });
  });
});
