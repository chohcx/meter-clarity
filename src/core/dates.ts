const DAY_MS = 86_400_000;

function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("日期格式必須是 YYYY-MM-DD");
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("日期不存在");
  }
  return date;
}

export function countInclusiveDays(start: string, end: string): number {
  const first = parseDateOnly(start);
  const last = parseDateOnly(end);
  const days = Math.floor((last.valueOf() - first.valueOf()) / DAY_MS) + 1;
  if (days < 1 || days > 370) throw new Error("帳期日期範圍無效");
  return days;
}

export function countTaipowerSummerDays(start: string, end: string): number {
  const first = parseDateOnly(start);
  const days = countInclusiveDays(start, end);
  let summer = 0;
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(first.valueOf() + offset * DAY_MS);
    const month = date.getUTCMonth() + 1;
    if (month >= 6 && month <= 9) summer += 1;
  }
  return summer;
}
