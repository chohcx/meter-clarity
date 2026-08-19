const MICRO_NTD_PER_NTD = 1_000_000n;

export function decimalToScaledInteger(value: string | number, scale: number): number {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d+)?$/.test(text)) throw new Error("請輸入零以上的數字");

  const [whole, fraction = ""] = text.split(".");
  const digits = Math.log10(scale);
  if (!Number.isInteger(digits) || fraction.length > digits) {
    throw new Error(`最多只能輸入 ${digits} 位小數`);
  }

  const result = Number(whole) * scale + Number(fraction.padEnd(digits, "0"));
  if (!Number.isSafeInteger(result)) throw new Error("數值超出可計算範圍");
  return result;
}

export function roundMicroNtd(microNtd: bigint): number {
  if (microNtd < 0n) throw new Error("金額不可為負數");
  return Number((microNtd + MICRO_NTD_PER_NTD / 2n) / MICRO_NTD_PER_NTD);
}

export function roundFractionalMicroNtd(numerator: bigint, denominator: bigint): number {
  if (numerator < 0n || denominator <= 0n) throw new Error("無效的金額比例");
  return Number(
    (numerator + (MICRO_NTD_PER_NTD * denominator) / 2n) /
      (MICRO_NTD_PER_NTD * denominator)
  );
}

export function ntdToMicro(value: string | number): bigint {
  return BigInt(decimalToScaledInteger(value, 1_000)) * 1_000n;
}
