export interface Tier {
  upToUnits: number | null;
  milliNtdPerUnit: number;
}

export function calculateTieredMicroNtd(
  usageMilliUnits: number,
  tiers: readonly Tier[],
  thresholdMultiplier = 1
): bigint {
  if (!Number.isSafeInteger(usageMilliUnits) || usageMilliUnits < 0) {
    throw new Error("用量必須是零以上且最多三位小數");
  }
  if (!Number.isInteger(thresholdMultiplier) || thresholdMultiplier < 1) {
    throw new Error("帳期月數必須是正整數");
  }

  let previousLimit = 0;
  let remaining = usageMilliUnits;
  let total = 0n;

  for (const tier of tiers) {
    const limit = tier.upToUnits === null ? null : tier.upToUnits * 1_000 * thresholdMultiplier;
    const capacity = limit === null ? remaining : Math.max(0, limit - previousLimit);
    const used = Math.min(remaining, capacity);
    total += BigInt(used) * BigInt(tier.milliNtdPerUnit);
    remaining -= used;
    if (remaining === 0) break;
    if (limit !== null) previousLimit = limit;
  }

  if (remaining > 0) throw new Error("費率級距未涵蓋全部用量");
  return total;
}
