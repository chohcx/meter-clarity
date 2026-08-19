import { useEffect, useMemo, useState, type FormEvent } from "react";
import { countInclusiveDays } from "../core/dates";
import { projectUsage } from "../core/forecast";
import type { BillEstimate, Commodity, Observation } from "../core/model";
import {
  estimateTaipowerResidential,
  estimateWater,
  taipowerResidential20251001,
  taipeiWater20160301,
  taiwanWaterCurrent
} from "../packs/tw";
import { decryptBackup, encryptBackup } from "./backup";
import { loadAppState, saveAppState, type AppState, type CalculatorForm } from "./storage";

interface Calculation {
  usage: number;
  current: BillEstimate;
  projected: BillEstimate;
  projectedLow: BillEstimate;
  projectedHigh: BillEstimate;
  forecastUsage: number;
}

const integerFormat = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });
const usageFormat = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 });

function calculate(form: CalculatorForm): Calculation {
  const startReading = Number(form.startReading);
  const currentReading = Number(form.currentReading);
  if (!Number.isFinite(startReading) || !Number.isFinite(currentReading)) throw new Error("請輸入起始與目前讀值");
  if (startReading < 0 || currentReading < startReading) throw new Error("目前讀值不得小於起始讀值");
  const usage = currentReading - startReading;
  if (usage <= 0) throw new Error("目前用量必須大於零");
  const elapsedDays = countInclusiveDays(form.periodStart, form.observedAt);
  const totalDays = countInclusiveDays(form.periodStart, form.periodEnd);
  if (elapsedDays > totalDays) throw new Error("讀表日期不得晚於帳期結束日");
  const forecast = projectUsage(usage, elapsedDays, totalDays);

  if (form.commodity === "electricity") {
    const estimate = (amount: number, end: string) => estimateTaipowerResidential({
      usageKwh: amount.toFixed(3),
      periodStart: form.periodStart,
      periodEnd: end,
      billingMonths: form.billingMonths
    });
    return {
      usage,
      current: estimate(usage, form.observedAt),
      projected: estimate(forecast.expected, form.periodEnd),
      projectedLow: estimate(forecast.low, form.periodEnd),
      projectedHigh: estimate(forecast.high, form.periodEnd),
      forecastUsage: forecast.expected
    };
  }

  const estimate = (amount: number) => estimateWater({
    provider: form.waterProvider,
    usageM3: amount.toFixed(3),
    meterDiameterMm: form.meterDiameterMm,
    billingMonths: form.billingMonths,
    asOf: form.observedAt,
    sewerNtdPerM3: form.sewerNtdPerM3,
    wasteNtdPerM3: form.wasteNtdPerM3,
    otherNtd: form.otherNtd
  });
  return {
    usage,
    current: estimate(usage),
    projected: estimate(forecast.expected),
    projectedLow: estimate(forecast.low),
    projectedHigh: estimate(forecast.high),
    forecastUsage: forecast.expected
  };
}

function ResultCard({ calculation, commodity }: { calculation: Calculation; commodity: Commodity }) {
  const unit = commodity === "electricity" ? "度電" : "度水";
  return (
    <section className="results">
      <div className="result-card primary-result">
        <span className="eyebrow">截至目前 · 估算</span>
        <strong>NT$ {integerFormat.format(calculation.current.totalNtd)}</strong>
        <p>已使用 {usageFormat.format(calculation.usage)} {unit}</p>
      </div>
      <div className="result-card">
        <span className="eyebrow">帳期結束 · 預測</span>
        <strong>NT$ {integerFormat.format(calculation.projected.totalNtd)}</strong>
        <p>
          約 {usageFormat.format(calculation.forecastUsage)} {unit} · 範圍 NT$ {integerFormat.format(calculation.projectedLow.totalNtd)}–{integerFormat.format(calculation.projectedHigh.totalNtd)}
        </p>
      </div>
      <div className="line-items">
        <h2>目前估算明細</h2>
        {calculation.current.lineItems.map((item) => (
          <div className="line-item" key={item.code}>
            <span>{item.label}</span><strong>NT$ {integerFormat.format(item.amountNtd)}</strong>
          </div>
        ))}
      </div>
      <details className="assumptions">
        <summary>估算依據與限制</summary>
        <ul>{calculation.current.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
    </section>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [backupPassword, setBackupPassword] = useState("");
  const form = state.form;

  useEffect(() => saveAppState(state), [state]);

  const tariff = useMemo(() => {
    if (form.commodity === "electricity") return taipowerResidential20251001;
    return form.waterProvider === "taipei-water" ? taipeiWater20160301 : taiwanWaterCurrent;
  }, [form.commodity, form.waterProvider]);

  const update = <K extends keyof CalculatorForm>(key: K, value: CalculatorForm[K]) => {
    setState((current) => ({ ...current, form: { ...current.form, [key]: value } }));
    setCalculation(null);
    setError("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      setCalculation(calculate(form));
      setError("");
      setNotice("");
    } catch (caught) {
      setCalculation(null);
      setError(caught instanceof Error ? caught.message : "無法計算");
    }
  };

  const saveReading = () => {
    if (!calculation) return;
    const observation: Observation = {
      id: crypto.randomUUID(),
      commodity: form.commodity,
      value: form.currentReading,
      unit: form.commodity === "electricity" ? "kWh" : "m3",
      observedAt: `${form.observedAt}T12:00:00+08:00`,
      receivedAt: new Date().toISOString(),
      source: form.source,
      quality: form.source === "bill" ? "verified" : "reported"
    };
    setState((current) => ({ ...current, observations: [observation, ...current.observations].slice(0, 200) }));
    setNotice("這次讀值已儲存在此裝置");
  };

  const exportBackup = async () => {
    try {
      const serialized = await encryptBackup(state, backupPassword);
      const url = URL.createObjectURL(new Blob([serialized], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `meter-clarity-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("加密備份已下載");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "備份失敗");
    }
  };

  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) return setError("備份檔不可超過 2 MB");
    try {
      const restored = await decryptBackup(await file.text(), backupPassword);
      setState(restored);
      setCalculation(null);
      setNotice("備份已還原");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "無法還原備份");
    }
  };

  const meterOptions = form.waterProvider === "taipei-water"
    ? ["13", "20", "25", "40", "50", "75", "100", "150", "200", "250", "300+"]
    : ["13", "20", "25", "40", "50", "75", "100", "150", "200", "250", "300", "350", "400+"];
  const unit = form.commodity === "electricity" ? "度電" : "度水";
  const liveMessage = notice || (calculation
    ? `估算完成。目前估算新臺幣 ${calculation.current.totalNtd} 元，已使用 ${calculation.usage} ${unit}；帳期預測新臺幣 ${calculation.projected.totalNtd} 元，範圍新臺幣 ${calculation.projectedLow.totalNtd} 至 ${calculation.projectedHigh.totalNtd} 元。`
    : "");

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="MeterClarity 首頁">
          <img src="/icon.svg" alt="" /><span>MeterClarity</span>
        </a>
        <span className="preview-badge">PRIVATE BUILD</span>
      </header>

      <main id="top">
        <section className="hero">
          <p className="eyebrow">帳單來之前，先看懂</p>
          <h1>你的水電，現在大約多少錢？</h1>
          <p>手動輸入電表或水表讀值，立即取得來源透明的本期估算與帳期預測。資料只留在這台裝置。</p>
        </section>

        <div className="workspace">
          <form className="calculator" onSubmit={submit}>
            <fieldset className="segmented">
              <legend className="sr-only">計算項目</legend>
              {(["electricity", "water"] as const).map((commodity) => (
                <button
                  className={form.commodity === commodity ? "active" : ""}
                  key={commodity}
                  type="button"
                  aria-pressed={form.commodity === commodity}
                  onClick={() => update("commodity", commodity)}
                >
                  {commodity === "electricity" ? "⚡ 電費" : "💧 水費"}
                </button>
              ))}
            </fieldset>

            <div className="section-heading">
              <span>1</span><div><h2>帳期與方案</h2><p>資料可從最近一期帳單找到</p></div>
            </div>

            {form.commodity === "water" && (
              <label>供水單位
                <select value={form.waterProvider} onChange={(event) => update("waterProvider", event.target.value as CalculatorForm["waterProvider"])}>
                  <option value="taiwan-water">台灣自來水公司</option>
                  <option value="taipei-water">臺北自來水事業處</option>
                </select>
              </label>
            )}

            <div className="form-grid">
              <label>帳期開始日<input type="date" required value={form.periodStart} onChange={(event) => update("periodStart", event.target.value)} /></label>
              <label>帳期結束日<input type="date" required value={form.periodEnd} onChange={(event) => update("periodEnd", event.target.value)} /></label>
              <label>計費週期
                <select value={form.billingMonths} onChange={(event) => update("billingMonths", Number(event.target.value) as 1 | 2)}>
                  <option value="1">每月</option><option value="2">每兩個月</option>
                </select>
              </label>
              {form.commodity === "water" && (
                <label>水表口徑
                  <select value={form.meterDiameterMm} onChange={(event) => update("meterDiameterMm", event.target.value)}>
                    {meterOptions.map((diameter) => <option value={diameter} key={diameter}>{diameter} mm</option>)}
                  </select>
                </label>
              )}
            </div>

            <div className="section-heading">
              <span>2</span><div><h2>輸入讀值</h2><p>不用提供地址、電號、水號或帳密</p></div>
            </div>
            <div className="form-grid">
              <label>帳期起始讀值<input type="number" min="0" step="0.001" inputMode="decimal" required value={form.startReading} onChange={(event) => update("startReading", event.target.value)} placeholder="例如 12540" /></label>
              <label>目前讀值<input type="number" min="0" step="0.001" inputMode="decimal" required value={form.currentReading} onChange={(event) => update("currentReading", event.target.value)} placeholder="例如 12865" /></label>
              <label>讀表日期<input type="date" required value={form.observedAt} onChange={(event) => update("observedAt", event.target.value)} /></label>
              <label>資料來源
                <select value={form.source} onChange={(event) => update("source", event.target.value as CalculatorForm["source"])}>
                  <option value="manual">人工抄表</option><option value="bill">正式帳單</option><option value="import">使用者匯入</option><option value="sensor">本地感測器</option>
                </select>
              </label>
            </div>

            {form.commodity === "water" && (
              <details className="optional-fees">
                <summary>地方代徵與其他費用（選填）</summary>
                <p>費率依縣市與接管狀況不同，請依最近帳單填寫；留白即不估算。</p>
                <div className="form-grid">
                  <label>污水費／度<input type="number" min="0" step="0.001" value={form.sewerNtdPerM3} onChange={(event) => update("sewerNtdPerM3", event.target.value)} placeholder="例如 5" /></label>
                  <label>清除處理費／度<input type="number" min="0" step="0.001" value={form.wasteNtdPerM3} onChange={(event) => update("wasteNtdPerM3", event.target.value)} /></label>
                  <label>其他固定費用<input type="number" min="0" step="0.001" value={form.otherNtd} onChange={(event) => update("otherNtd", event.target.value)} /></label>
                </div>
              </details>
            )}

            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="live-status">{liveMessage}</div>
            {error && <div className="message error" role="alert">{error}</div>}
            {notice && <div className="message success">{notice}</div>}
            <button className="calculate-button" type="submit">計算本期估算</button>
            <p className="form-note">估算不等於正式帳單；每筆結果都會顯示費率來源與限制。</p>
          </form>

          <aside className="output-panel">
            {calculation ? (
              <>
                <div className="freshness"><span className="status-dot" />{form.source === "bill" ? "正式帳單讀值" : "使用者提供讀值"} · {form.observedAt}</div>
                <ResultCard calculation={calculation} commodity={form.commodity} />
                <button className="secondary-button" type="button" onClick={saveReading}>儲存這次讀值</button>
              </>
            ) : (
              <div className="empty-state"><div>↗</div><h2>結果會清楚分成兩種</h2><p><strong>目前估算</strong>顯示截至讀表日的累計費用；<strong>帳期預測</strong>依目前每日平均推算，並提供 ±10% 範圍。</p></div>
            )}

            <div className="source-card">
              <span className="eyebrow">目前費率版本</span>
              <strong>{tariff.id}</strong>
              <p>有效日起：{tariff.effectiveFrom}</p>
              {tariff.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title} ↗</a>)}
            </div>
          </aside>
        </div>

        <section className="privacy-section">
          <div><p className="eyebrow">LOCAL-FIRST</p><h2>你的生活資料，不必交給另一個雲端。</h2><p>讀值與設定不會自動上傳，但會以未加密形式存在這個瀏覽器設定檔；能存取此設定檔的人或擴充功能也可能讀取。共用裝置請勿儲存，清除網站資料前請先下載加密備份。</p></div>
          <div className="backup-controls">
            <label>備份密碼<input type="password" minLength={8} autoComplete="new-password" value={backupPassword} onChange={(event) => setBackupPassword(event.target.value)} placeholder="至少 8 個字元" /></label>
            <div>
              <button className="secondary-button" type="button" onClick={exportBackup}>下載加密備份</button>
              <label className="file-button">還原備份<input type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} /></label>
            </div>
          </div>
        </section>
      </main>

      <footer><span>MeterClarity · 私有重建版本</span><span>Apache-2.0 · 零遙測 · 非官方帳單</span></footer>
    </>
  );
}
