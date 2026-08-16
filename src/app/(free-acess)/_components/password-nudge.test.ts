import { beforeEach, describe, expect, it } from "vitest";
import {
  PASSWORD_NUDGE_COOKIE,
  dismissPasswordNudge,
  resetPasswordNudge,
} from "./password-nudge";

describe("password-nudge helpers", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "document", {
      value: {
        cookie: "",
      },
      writable: true,
      configurable: true,
    });
  });

  it("sets the dismiss cookie", () => {
    dismissPasswordNudge();
    expect(document.cookie).toContain(`${PASSWORD_NUDGE_COOKIE}=1`);
  });

  it("resets the dismiss cookie with past expiration", () => {
    resetPasswordNudge();
    expect(document.cookie).toContain("expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});
