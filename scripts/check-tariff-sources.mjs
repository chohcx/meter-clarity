import { mkdir, readFile, writeFile } from "node:fs/promises";

const sources = JSON.parse(await readFile(new URL("./tariff-sources.json", import.meta.url), "utf8"));
const results = [];

for (const source of sources) {
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "MeterClarity tariff monitor (+https://github.com/chohcx/meter-clarity)" },
      signal: AbortSignal.timeout(20_000)
    });
    const body = await response.text();
    const missing = source.requiredText.filter((text) => !body.includes(text));
    results.push({ id: source.id, url: source.url, status: response.status, missing, ok: response.ok && missing.length === 0 });
  } catch (error) {
    results.push({ id: source.id, url: source.url, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

const report = { checkedAt: new Date().toISOString(), results };
await mkdir("tmp", { recursive: true });
await writeFile("tmp/tariff-monitor-report.json", `${JSON.stringify(report, null, 2)}\n`);

for (const result of results) {
  console.log(`${result.ok ? "OK" : "CHECK"} ${result.id}`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
