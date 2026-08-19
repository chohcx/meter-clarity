import { decimalToScaledInteger, ntdToMicro, roundMicroNtd } from "../../core/money";
import { calculateTieredMicroNtd, type Tier } from "../../core/progressive";
import type { BillEstimate, BillLineItem, TariffVersion } from "../../core/model";

type MeterFees = Readonly<Record<string, number>>;

interface WaterRules {
  tiers: readonly Tier[];
  monthlyBasicFeeNtd: MeterFees;
  conservation: "usage-0.5" | "gross-water-charge-divided-by-21";
}

const taiwanWaterTiers: readonly Tier[] = [
  { upToUnits: 10, milliNtdPerUnit: 7_350 },
  { upToUnits: 30, milliNtdPerUnit: 9_450 },
  { upToUnits: 50, milliNtdPerUnit: 11_550 },
  { upToUnits: null, milliNtdPerUnit: 12_075 }
];

const taipeiWaterTiers: readonly Tier[] = [
  { upToUnits: 20, milliNtdPerUnit: 5_000 },
  { upToUnits: 60, milliNtdPerUnit: 6_700 },
  { upToUnits: 200, milliNtdPerUnit: 8_500 },
  { upToUnits: 1_000, milliNtdPerUnit: 14_000 },
  { upToUnits: null, milliNtdPerUnit: 20_000 }
];

export const taiwanWaterCurrent: TariffVersion<WaterRules> = {
  id: "tw-taiwan-water-current",
  jurisdiction: "TW",
  provider: "taiwan-water",
  commodity: "water",
  currency: "TWD",
  effectiveFrom: "1997-05-01",
  effectiveTo: null,
  rules: {
    tiers: taiwanWaterTiers,
    monthlyBasicFeeNtd: {
      "13": 17.85, "20": 35.7, "25": 66.15, "40": 196.35, "50": 357,
      "75": 963.9, "100": 1909.95, "150": 5301.45, "200": 10531.5,
      "250": 18599.7, "300": 29184.75, "350": 41626.2, "400+": 58119.6
    },
    conservation: "gross-water-charge-divided-by-21"
  },
  sources: [
    {
      title: "經濟部投資臺灣入口網：公用事業費用",
      url: "https://investtaiwan.nat.gov.tw/showPagecht95?lang=cht&search=95",
      retrievedAt: "2026-08-19"
    },
    {
      title: "經濟部水利署節約用水資訊網：水價計費方式",
      url: "https://web.wra.gov.tw/wcis/cp.aspx?Create=1&n=7883",
      retrievedAt: "2026-08-19"
    }
  ]
};

export const taipeiWater20160301: TariffVersion<WaterRules> = {
  id: "tw-taipei-water-2016-03-01",
  jurisdiction: "TW",
  provider: "taipei-water",
  commodity: "water",
  currency: "TWD",
  effectiveFrom: "2016-03-01",
  effectiveTo: null,
  rules: {
    tiers: taipeiWaterTiers,
    monthlyBasicFeeNtd: {
      "13": 17, "20": 68, "25": 126, "40": 374, "50": 680, "75": 1836,
      "100": 3638, "150": 10098, "200": 20060, "250": 35428, "300+": 55590
    },
    conservation: "usage-0.5"
  },
  sources: [
    {
      title: "臺北自來水事業處：自 105 年 3 月 1 日起水費應繳總金額如何計算？",
      url: "https://www.water.gov.taipei/News_Content.aspx?n=30E4EDA27F6D9953&s=451916B5DE7ECE31",
      retrievedAt: "2026-08-19"
    }
  ]
};

export interface WaterEstimateInput {
  provider: "taiwan-water" | "taipei-water";
  usageM3: string | number;
  meterDiameterMm: string;
  billingMonths: 1 | 2;
  asOf: string;
  sewerNtdPerM3?: string | number;
  wasteNtdPerM3?: string | number;
  otherNtd?: string | number;
}

function usageRateLine(usageMilli: number, rate: string | number, code: string, label: string): BillLineItem {
  const rateMilli = decimalToScaledInteger(rate, 1_000);
  return {
    code,
    label,
    amountNtd: roundMicroNtd(BigInt(usageMilli) * BigInt(rateMilli)),
    kind: "user-supplied"
  };
}

export function estimateWater(input: WaterEstimateInput): BillEstimate {
  if (input.provider !== "taiwan-water" && input.provider !== "taipei-water") throw new Error("不支援的供水單位");
  if (input.billingMonths !== 1 && input.billingMonths !== 2) throw new Error("帳期只支援 1 或 2 個月");
  const tariff = input.provider === "taipei-water" ? taipeiWater20160301 : taiwanWaterCurrent;
  if (input.asOf < tariff.effectiveFrom) throw new Error(`所選日期早於費率生效日 ${tariff.effectiveFrom}`);
  const usageMilli = decimalToScaledInteger(input.usageM3, 1_000);
  const basicFee = tariff.rules.monthlyBasicFeeNtd[input.meterDiameterMm];
  if (basicFee === undefined) throw new Error("所選水表口徑不適用於此供應商");

  const usageMicro = calculateTieredMicroNtd(usageMilli, tariff.rules.tiers, input.billingMonths);
  const waterChargeNtd = roundMicroNtd(usageMicro);
  const basicNtd = roundMicroNtd(ntdToMicro(basicFee * input.billingMonths));
  const conservationNtd = tariff.rules.conservation === "usage-0.5"
    ? roundMicroNtd(BigInt(usageMilli) * 500n)
    : roundMicroNtd(usageMicro / 21n);

  const lineItems: BillLineItem[] = [
    { code: "usage", label: "用水費", amountNtd: waterChargeNtd, kind: "official-rule" },
    { code: "basic", label: "基本費", amountNtd: basicNtd, kind: "official-rule" },
    { code: "conservation", label: "水源保育與回饋費", amountNtd: conservationNtd, kind: "official-rule" }
  ];

  if (input.sewerNtdPerM3 && Number(input.sewerNtdPerM3) > 0) {
    lineItems.push(usageRateLine(usageMilli, input.sewerNtdPerM3, "sewer", "污水下水道使用費"));
  }
  if (input.wasteNtdPerM3 && Number(input.wasteNtdPerM3) > 0) {
    lineItems.push(usageRateLine(usageMilli, input.wasteNtdPerM3, "waste", "清除處理費"));
  }
  if (input.otherNtd && Number(input.otherNtd) > 0) {
    lineItems.push({
      code: "other",
      label: "帳單上的其他費用",
      amountNtd: roundMicroNtd(ntdToMicro(input.otherNtd)),
      kind: "user-supplied"
    });
  }

  return {
    tariffId: tariff.id,
    asOf: input.asOf,
    usage: String(input.usageM3),
    unit: "m3",
    lineItems,
    totalNtd: lineItems.reduce((sum, item) => sum + item.amountNtd, 0),
    assumptions: [
      `帳期級距與基本費按 ${input.billingMonths} 個月計算`,
      "地方清除處理費、污水費與加壓費依帳單而異；未填寫者不計",
      "結果為估算，正式金額以供應商帳單為準"
    ]
  };
}
