import { describe, expect, it } from "vitest";
import { estimateWater, taiwanWaterCurrent } from "./water";

describe("Taiwan water tariffs", () => {
  it("matches Taiwan Water's complete official meter-fee table", () => {
    expect(taiwanWaterCurrent.rules.monthlyBasicFeeNtd).toEqual({
      "13": 17.85,
      "20": 35.7,
      "25": 66.15,
      "40": 196.35,
      "50": 357,
      "75": 963.9,
      "100": 1909.95,
      "150": 5301.45,
      "200": 10531.5,
      "250": 18599.7,
      "300": 29184.75,
      "350": 41626.2,
      "400+": 58119.6
    });
  });

  it("rounds Taiwan Water's official two-month 110 m3 usage example to whole NTD", () => {
    const result = estimateWater({
      provider: "taiwan-water",
      usageM3: 110,
      meterDiameterMm: "13",
      billingMonths: 2,
      asOf: "2026-08-19"
    });
    expect(result.lineItems[0].amountNtd).toBe(1108);
  });

  it("matches Taipei Water's official 25 m3, 20 mm, sewer-connected example", () => {
    const result = estimateWater({
      provider: "taipei-water",
      usageM3: 25,
      meterDiameterMm: "20",
      billingMonths: 1,
      asOf: "2026-08-19",
      sewerNtdPerM3: 5
    });
    expect(result.lineItems.map((item) => item.amountNtd)).toEqual([134, 68, 13, 125]);
    expect(result.totalNtd).toBe(340);
  });

  it("doubles Taiwan Water thresholds and basic fee for a two-month bill", () => {
    const result = estimateWater({
      provider: "taiwan-water",
      usageM3: 40,
      meterDiameterMm: "13",
      billingMonths: 2,
      asOf: "2026-08-19"
    });
    expect(result.lineItems[0].amountNtd).toBe(336);
    expect(result.lineItems[1].amountNtd).toBe(36);
    expect(result.totalNtd).toBe(388);
  });

  it("rejects unsupported runtime values and pre-effective dates", () => {
    expect(() => estimateWater({
      provider: "unknown" as "taiwan-water",
      usageM3: 25,
      meterDiameterMm: "20",
      billingMonths: 1,
      asOf: "2026-08-19"
    })).toThrow("不支援的供水單位");
    expect(() => estimateWater({
      provider: "taipei-water",
      usageM3: 25,
      meterDiameterMm: "20",
      billingMonths: 1,
      asOf: "2016-02-29"
    })).toThrow("早於費率生效日");
  });
});
