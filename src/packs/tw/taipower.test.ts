import { describe, expect, it } from "vitest";
import { estimateTaipowerResidential } from "./taipower";

describe("Taipower residential non-TOU", () => {
  it("matches Taipower's Sep 13 to Nov 11, 350 kWh official example", () => {
    const result = estimateTaipowerResidential({
      usageKwh: 350,
      periodStart: "2025-09-13",
      periodEnd: "2025-11-11",
      billingMonths: 2
    });
    expect(result.lineItems[0].amountNtd).toBe(685);
    expect(result.totalNtd).toBe(685);
  });

  it("applies the monthly minimum charge", () => {
    expect(estimateTaipowerResidential({
      usageKwh: 10,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      billingMonths: 1
    }).totalNtd).toBe(100);
  });

  it("rejects unsupported periods and dates before this tariff existed", () => {
    expect(() => estimateTaipowerResidential({
      usageKwh: 300,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      billingMonths: 3 as 1
    })).toThrow("帳期只支援");
    expect(() => estimateTaipowerResidential({
      usageKwh: 300,
      periodStart: "2025-09-01",
      periodEnd: "2025-09-30",
      billingMonths: 1
    })).toThrow("早於費率生效日");
  });
});
