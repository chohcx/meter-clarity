import { describe, expect, it } from "vitest";
import { decryptBackup, encryptBackup } from "./backup";
import { defaultState } from "./storage";

describe("encrypted local backup", () => {
  it("round-trips the versioned state without exposing readings", async () => {
    const state = defaultState(new Date("2026-08-19T00:00:00Z"));
    state.form.currentReading = "1234";
    const serialized = await encryptBackup(state, "correct horse");
    expect(serialized).not.toContain("1234");
    await expect(decryptBackup(serialized, "correct horse")).resolves.toEqual(state);
  });

  it("rejects a wrong password", async () => {
    const serialized = await encryptBackup(defaultState(), "correct horse");
    await expect(decryptBackup(serialized, "wrong horse!")).rejects.toThrow("密碼錯誤");
  });

  it("rejects authenticated backups with unsupported nested state", async () => {
    const state = defaultState();
    (state.form as unknown as { billingMonths: number }).billingMonths = 3;
    const serialized = await encryptBackup(state, "correct horse");
    await expect(decryptBackup(serialized, "correct horse")).rejects.toThrow("計算設定無效");
  });
});
