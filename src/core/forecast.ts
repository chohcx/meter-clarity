export function projectUsage(
  usage: string | number,
  elapsedDays: number,
  totalDays: number
): { low: number; expected: number; high: number } {
  const current = Number(usage);
  if (!Number.isFinite(current) || current < 0) throw new Error("目前用量無效");
  if (!Number.isInteger(elapsedDays) || !Number.isInteger(totalDays) || elapsedDays < 1 || totalDays < elapsedDays) {
    throw new Error("預測日期範圍無效");
  }
  const expected = (current / elapsedDays) * totalDays;
  return { low: Math.max(current, expected * 0.9), expected, high: expected * 1.1 };
}
