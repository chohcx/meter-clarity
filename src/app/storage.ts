import type { Commodity, Observation, ReadingSource } from "../core/model";

export const STORAGE_KEY = "meter-clarity:v1";

export interface CalculatorForm {
  commodity: Commodity;
  waterProvider: "taiwan-water" | "taipei-water";
  billingMonths: 1 | 2;
  periodStart: string;
  periodEnd: string;
  observedAt: string;
  startReading: string;
  currentReading: string;
  meterDiameterMm: string;
  sewerNtdPerM3: string;
  wasteNtdPerM3: string;
  otherNtd: string;
  source: ReadingSource;
}

export interface AppState {
  schemaVersion: 1;
  form: CalculatorForm;
  observations: Observation[];
}

type UnknownRecord = Record<string, unknown>;

const formKeys = [
  "commodity", "waterProvider", "billingMonths", "periodStart", "periodEnd", "observedAt",
  "startReading", "currentReading", "meterDiameterMm", "sewerNtdPerM3", "wasteNtdPerM3",
  "otherNtd", "source"
] as const;
const observationKeys = [
  "id", "commodity", "value", "unit", "observedAt", "receivedAt", "source", "quality"
] as const;
const meterDiameters = [
  "13", "20", "25", "40", "50", "75", "100", "150", "200", "250", "300", "300+", "350", "400+"
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: UnknownRecord, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
}

function isOneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === "string" && choices.includes(value as T);
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && isoDate(date) === value;
}

function isNumericText(value: unknown, allowEmpty = true): value is string {
  return typeof value === "string" && ((allowEmpty && value === "") || /^\d+(?:\.\d+)?$/.test(value));
}

function isObservation(value: unknown): value is Observation {
  if (!isRecord(value) || !hasOnlyKeys(value, observationKeys)) return false;
  if (!isOneOf(value.commodity, ["electricity", "water"])) return false;
  return typeof value.id === "string" && value.id.length > 0 && value.id.length <= 128
    && isNumericText(value.value, false)
    && value.unit === (value.commodity === "electricity" ? "kWh" : "m3")
    && typeof value.observedAt === "string" && Number.isFinite(Date.parse(value.observedAt))
    && typeof value.receivedAt === "string" && Number.isFinite(Date.parse(value.receivedAt))
    && isOneOf(value.source, ["manual", "bill", "import", "sensor", "provider"])
    && isOneOf(value.quality, ["verified", "reported", "estimated"]);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function defaultState(now = new Date()): AppState {
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 30);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 29);
  return {
    schemaVersion: 1,
    form: {
      commodity: "electricity",
      waterProvider: "taiwan-water",
      billingMonths: 2,
      periodStart: isoDate(start),
      periodEnd: isoDate(end),
      observedAt: isoDate(now),
      startReading: "",
      currentReading: "",
      meterDiameterMm: "13",
      sewerNtdPerM3: "",
      wasteNtdPerM3: "",
      otherNtd: "",
      source: "manual"
    },
    observations: []
  };
}

export function parseAppState(value: unknown): AppState {
  if (!isRecord(value)) throw new Error("備份內容不是物件");
  if (!hasOnlyKeys(value, ["schemaVersion", "form", "observations"]) || value.schemaVersion !== 1
    || !isRecord(value.form) || !Array.isArray(value.observations)) {
    throw new Error("不支援的備份版本或內容不完整");
  }
  const form = value.form;
  const validForm = hasOnlyKeys(form, formKeys)
    && isOneOf(form.commodity, ["electricity", "water"])
    && isOneOf(form.waterProvider, ["taiwan-water", "taipei-water"])
    && (form.billingMonths === 1 || form.billingMonths === 2)
    && isDateOnly(form.periodStart) && isDateOnly(form.periodEnd) && isDateOnly(form.observedAt)
    && isNumericText(form.startReading) && isNumericText(form.currentReading)
    && isOneOf(form.meterDiameterMm, meterDiameters)
    && isNumericText(form.sewerNtdPerM3) && isNumericText(form.wasteNtdPerM3) && isNumericText(form.otherNtd)
    && isOneOf(form.source, ["manual", "bill", "import", "sensor"]);
  if (!validForm) throw new Error("備份中的計算設定無效或不受支援");
  if (value.observations.length > 200 || !value.observations.every(isObservation)) {
    throw new Error("備份中的讀數紀錄無效或超過 200 筆");
  }
  return value as unknown as AppState;
}

export function loadAppState(storage: Storage = localStorage): AppState {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    return parseAppState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveAppState(state: AppState, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
