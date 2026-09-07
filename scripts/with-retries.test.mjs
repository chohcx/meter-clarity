import { expect, test, vi } from "vitest";
import { withRetries } from "./with-retries.mjs";

test("retries transient failures", async () => {
  const expected = {};
  const operation = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValue(expected);

  await expect(withRetries(operation, 0)).resolves.toBe(expected);
  expect(operation).toHaveBeenCalledTimes(2);
});

test("stops after three failures", async () => {
  const operation = vi.fn().mockRejectedValue(new Error("still down"));

  await expect(withRetries(operation, 0)).rejects.toThrow("still down");
  expect(operation).toHaveBeenCalledTimes(3);
});
