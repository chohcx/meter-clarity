import { countInclusiveDays, countTaipowerSummerDays } from "../../core/dates";
import { decimalToScaledInteger, roundFractionalMicroNtd } from "../../core/money";
import { calculateTieredMicroNtd, type Tier } from "../../core/progressive";
import type { BillEstimate, TariffVersion } from "../../core/model";

interface TaipowerResidentialRules {
  summerMonths: readonly number[];
  minimumNtdPerMonth: number;
  summerTiers: readonly Tier[];
  nonSummerTiers: readonly Tier[];
}

const summerTiers: readonly Tier[] = [
  { upToUnits: 120, milliNtdPerUnit: 1_780 },
  { upToUnits: 330, milliNtdPerUnit: 2_550 },
  { upToUnits: 500, milliNtdPerUnit: 3_800 },
  { upToUnits: 700, milliNtdPerUnit: 5_140 },
  { upToUnits: 1_000, milliNtdPerUnit: 6_440 },
  { upToUnits: null, milliNtdPerUnit: 8_860 }
];

const nonSummerTiers: readonly Tier[] = [
  { upToUnits: 120, milliNtdPerUnit: 1_780 },
  { upToUnits: 330, milliNtdPerUnit: 2_260 },
  { upToUnits: 500, milliNtdPerUnit: 3_130 },
  { upToUnits: 700, milliNtdPerUnit: 4_240 },
  { upToUnits: 1_000, milliNtdPerUnit: 5_270 },
  { upToUnits: null, milliNtdPerUnit: 7_030 }
];

export const taipowerResidential20251001: TariffVersion<TaipowerResidentialRules> = {
  id: "tw-taipower-residential-non-tou-2025-10-01",
  jurisdiction: "TW",
  provider: "taipower",
  commodity: "electricity",
  currency: "TWD",
  effectiveFrom: "2025-10-01",
  effectiveTo: null,
  rules: {
    summerMonths: [6, 7, 8, 9],
    minimumNtdPerMonth: 100,
    summerTiers,
    nonSummerTiers
  },
  sources: [
    {
      title: "台灣電力公司開放資料：各類電價表 JSON",
      url: "https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json",
      retrievedAt: "2026-08-19"
    },
    {
      title: "台灣電力公司：請問電費如何計算？",
      url: "https://hc2.taipower.com.tw/2289/2558/2705/22997/normalPost",
      retrievedAt: "2026-08-19"
    },
    {
      title: "台灣電力公司 114 年 10 月 1 日起實施電價表",
      url: "https://hc2.taipower.com.tw/media/xtofy2yw/%E8%A9%B3%E7%B4%B0%E9%9B%BB%E5%83%B9%E8%A1%A8.pdf?mediaDL=true",
      retrievedAt: "2026-08-19"
    }
  ]
};

export interface TaipowerEstimateInput {
  usageKwh: string | number;
  periodStart: string;
  periodEnd: string;
  billingMonths: 1 | 2;
}

export function estimateTaipowerResidential(input: TaipowerEstimateInput): BillEstimate {
  if (input.billingMonths !== 1 && input.billingMonths !== 2) throw new Error("帳期只支援 1 或 2 個月");
  if (input.periodEnd < taipowerResidential20251001.effectiveFrom) {
    throw new Error(`所選帳期早於費率生效日 ${taipowerResidential20251001.effectiveFrom}`);
  }
  const usageMilli = decimalToScaledInteger(input.usageKwh, 1_000);
  const totalDays = countInclusiveDays(input.periodStart, input.periodEnd);
  const summerDays = countTaipowerSummerDays(input.periodStart, input.periodEnd);
  const nonSummerDays = totalDays - summerDays;
  const summerMicro = calculateTieredMicroNtd(usageMilli, summerTiers, input.billingMonths);
  const nonSummerMicro = calculateTieredMicroNtd(usageMilli, nonSummerTiers, input.billingMonths);
  const weightedMicroDays = summerMicro * BigInt(summerDays) + nonSummerMicro * BigInt(nonSummerDays);
  const calculatedNtd = roundFractionalMicroNtd(weightedMicroDays, BigInt(totalDays));
  const minimumNtd = 100 * input.billingMonths;
  const totalNtd = Math.max(calculatedNtd, minimumNtd);

  return {
    tariffId: taipowerResidential20251001.id,
    asOf: input.periodEnd,
    usage: String(input.usageKwh),
    unit: "kWh",
    lineItems: [
      { code: "energy", label: "流動電費估算", amountNtd: calculatedNtd, kind: "official-rule" },
      ...(totalNtd > calculatedNtd
        ? [{ code: "minimum", label: "每月最低計收調整", amountNtd: totalNtd - calculatedNtd, kind: "adjustment" as const }]
        : [])
    ],
    totalNtd,
    assumptions: [
      "住宅用非時間電價",
      `帳期級距按 ${input.billingMonths} 個月計算`,
      `夏月 ${summerDays} 日、非夏月 ${nonSummerDays} 日`,
      "未含節電獎勵、公設分攤、追補退費或其他帳單調整"
    ]
  };
}
