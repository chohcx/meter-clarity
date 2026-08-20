# MeterClarity

> 帳單來之前，先看懂本期水電用了多少、大約多少錢，以及資料有多新。

MeterClarity 是一個 local-first、可安裝、可離線使用的水電費估算 PWA。目前是 **v0.1.0 Technical Preview**，不代表台電、台灣自來水公司或臺北自來水事業處。

English documentation: [docs/README.en.md](docs/README.en.md)

[開啟 MeterClarity 網頁版](https://chohcx.github.io/meter-clarity/)

## 現階段支援

- 台電住宅非時間電價，含夏月／非夏月、累進級距與跨季帳期。
- 台灣自來水公司的一般用水費與基本費。
- 臺北自來水事業處的一般用水費、基本費及可選污水費。
- 人工讀表、透明的每日平均預測、來源與假設揭露。
- 裝置內儲存、AES-GCM 加密備份、PWA 離線快取。

不支援時間電價、金門／馬祖水費、供應商帳密登入、官方即時資料、AI 預測或原生 App。估算不等於正式帳單。

## Windows 一鍵開啟

安裝 Node.js 20.19 以上後，在專案資料夾雙擊 **`Open MeterClarity.cmd`**。小工具會在第一次使用時安裝相依套件、建立正式版本，接著自動用瀏覽器開啟 MeterClarity。使用期間請保留服務視窗；關閉視窗即可停止。

## 開發

需求：Node.js 20.19 以上。

```sh
npm install
npx playwright install chromium
npm run dev
npm run check
```

`npm run check` 會依序執行 TypeScript、單元測試、production build，以及桌面／手機 Chromium 的備份還原、離線與 WCAG 自動檢查。

## 正確性原則

- 所有費率都有有效日期與官方來源。
- 舊費率不可覆寫，只能新增版本。
- 費率更新必須先通過官方案例或可重現的 golden tests。
- 畫面永遠分開「目前估算」、「帳期預測」與「正式帳單」。
- 地方清除、污水、加壓、折扣等不確定項目必須由使用者依帳單提供，不偷偷假設。

詳見 [Technical Preview 揭露與示範](docs/technical-preview.md)、[59 秒合成資料示範](docs/assets/meterclarity-60-second-demo.webm)、[人工驗證手冊](docs/manual-verification.md)、[架構](docs/architecture.md)、[費率維護](docs/tariffs.md)、[驗證紀錄](docs/verification.md)與[支援範圍](docs/coverage.md)。

## 公開門檻

第一次公開將標示為 `v0.1.0 Technical Preview`。在跨家庭與完整帳期驗證完成前，不會稱為穩定版。詳細條件見 [ROADMAP.md](ROADMAP.md)。

目前的正確性證據來自三家供應商的官方公開案例與合成資料 NVDA 實機流程；真實家庭驗證案例與完整實際帳期均為零，正式帳單仍是唯一依據。

## 授權與隱私

新架構採 [Apache-2.0](LICENSE)。舊版歷史曾以 MIT 發布，既有授權不追溯撤回。

應用程式預設零遙測；讀值和設定只存在瀏覽器設定檔，但並未在瀏覽器儲存空間內加密。請勿在 Issue、測試 fixture 或 commit 中放入姓名、地址、水電號、條碼或未遮蔽帳單。
