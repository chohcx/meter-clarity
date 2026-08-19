import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("restores an encrypted backup and persists the restored state", async ({ page }) => {
  await page.getByLabel("帳期起始讀值").fill("1000");
  await page.getByLabel("目前讀值").fill("1300");
  await page.getByLabel("備份密碼").fill("correct horse");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下載加密備份" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();

  await page.getByLabel("目前讀值").fill("1999");
  await page.locator('input[type="file"]').setInputFiles(downloadPath!);
  await expect(page.getByRole("status")).toHaveText("備份已還原");
  await expect(page.getByLabel("目前讀值")).toHaveValue("1300");

  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem("meter-clarity:v1") || "null")?.form?.currentReading
  )).toBe("1300");
  await page.reload();
  await expect(page.getByLabel("目前讀值")).toHaveValue("1300");
});

test("reloads the installed application while offline", async ({ context, page }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("你的水電，現在大約多少錢？");
  } finally {
    await context.setOffline(false);
  }
});

test("meets automated WCAG checks and exposes restore to the keyboard", async ({ page }) => {
  const analyze = () => new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
    .analyze();
  expect((await analyze()).violations).toEqual([]);

  await page.getByLabel("帳期起始讀值").fill("1000");
  await page.getByLabel("目前讀值").fill("1300");
  await page.getByRole("button", { name: "計算本期估算" }).click();
  await expect(page.locator(".results")).toBeVisible();
  expect((await analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: /水費/ }).click();
  await page.getByText("地方代徵與其他費用（選填）").click();
  await expect(page.getByLabel("污水費／度")).toBeVisible();
  expect((await analyze()).violations).toEqual([]);

  const fileInput = page.locator('input[type="file"]');
  let reachedRestore = false;
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press("Tab");
    if (await fileInput.evaluate((element) => element === document.activeElement)) {
      reachedRestore = true;
      break;
    }
  }
  expect(reachedRestore).toBe(true);
});
