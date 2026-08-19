export type Commodity = "electricity" | "water";
export type ReadingSource = "manual" | "bill" | "import" | "sensor" | "provider";
export type ReadingQuality = "verified" | "reported" | "estimated";

export interface Observation {
  id: string;
  commodity: Commodity;
  value: string;
  unit: "kWh" | "m3";
  observedAt: string;
  receivedAt: string;
  source: ReadingSource;
  quality: ReadingQuality;
}

export interface TariffSource {
  url: string;
  retrievedAt: string;
  title: string;
}

export interface TariffVersion<T> {
  id: string;
  jurisdiction: "TW";
  provider: string;
  commodity: Commodity;
  currency: "TWD";
  effectiveFrom: string;
  effectiveTo: string | null;
  rules: T;
  sources: readonly TariffSource[];
}

export interface BillLineItem {
  code: string;
  label: string;
  amountNtd: number;
  kind: "official-rule" | "user-supplied" | "adjustment";
}

export interface BillEstimate {
  tariffId: string;
  asOf: string;
  usage: string;
  unit: "kWh" | "m3";
  lineItems: readonly BillLineItem[];
  totalNtd: number;
  assumptions: readonly string[];
}

export interface OfficialBill {
  provider: string;
  periodStart: string;
  periodEnd: string;
  totalNtd: number;
  lineItems: readonly BillLineItem[];
}
