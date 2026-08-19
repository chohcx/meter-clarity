import { describe, expect, it } from "vitest";
import { calculateTieredMicroNtd } from "./progressive";
import { roundMicroNtd } from "./money";

describe("progressive tariff engine", () => {
  const tiers = [
    { upToUnits: 10, milliNtdPerUnit: 1_000 },
    { upToUnits: 20, milliNtdPerUnit: 2_000 },
    { upToUnits: null, milliNtdPerUnit: 3_000 }
  ] as const;

  it("charges each block without losing boundary units", () => {
    expect(roundMicroNtd(calculateTieredMicroNtd(25_000, tiers))).toBe(45);
  });

  it("multiplies thresholds for a two-month bill", () => {
    expect(roundMicroNtd(calculateTieredMicroNtd(25_000, tiers, 2))).toBe(30);
  });
});
