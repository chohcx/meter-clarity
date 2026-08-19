# Technical Preview disclosures

This page is prepared for the future `v0.1.0 Technical Preview`. The repository and build remain private until every private-rebuild gate in the roadmap is complete.

## Validation maturity

The preview has reproducible golden tests for public examples from all three supported providers and an observed keyboard-only NVDA 2026.1.1 run of the synthetic-data workflow. That NVDA run found a missing result announcement; commit `25d2060` fixed it, and the passing rerun announced the estimate, local save, backup download, and restore.

There are currently **zero real-household validation cases and zero observed complete live billing cycles**. This preview must not be described as stable or as validated against household bills. The official provider bill remains authoritative. Public preview users may opt in to de-identified discrepancy reports; those reports are evidence to investigate, not proof of correctness by themselves.

## Official sources

- Taipower residential non-time-of-use tariff: [official open-data JSON](https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json).
- Taiwan Water meter fees: [official CSV](https://www.water.gov.tw/opendata/syst4.csv), [rates and formulas](https://www.water.gov.tw/ch/Subject/Detail/1288?nodeId=813), and [official sample bill](https://www.water.gov.tw/ch/Subject/Detail/108068?nodeId=813).
- Taipei Water rates and official example: [official calculation page](https://www.water.gov.taipei/News_Content.aspx?n=30E4EDA27F6D9953&s=451916B5DE7ECE31).

The active source URLs, retrieval dates, effective dates, and immutable rule versions live with each tariff in `src/packs/tw/`. The weekly monitor only detects source changes; it cannot update a tariff automatically.

## Assumptions

- Usage is the difference between the supplied start and current readings.
- The forecast extends the observed daily average to the end of the billing period and shows a ±10% range; it is not an AI or weather-adjusted prediction.
- Water billing cycles scale both progressive thresholds and basic fees by one or two months.
- Provider base charges are calculated automatically. Local cleanup, sewer, pressure, discounts, rebates, and other account-specific items are included only when the user supplies them.
- Displayed line items are rounded to whole New Taiwan dollars. The official provider bill remains authoritative.

## Unsupported cases

- Taipower time-of-use, demand, business, renewable-energy, and special-contract tariffs.
- Kinmen and Matsu water tariffs, non-general water account types, and automatic shared-meter allocation.
- Provider login, account or meter identifiers, automatic interval data, private API reverse engineering, and payment.
- Automatic tariff selection for dates outside the bundled effective versions.
- Native apps, smart-meter hardware, AI forecasts, and automatic cloud sync.

## Privacy and data loss limits

- The app has no account, server-side storage, provider API request, or default telemetry.
- Form values and saved readings are stored as unencrypted JSON in this browser profile's `localStorage`. People, extensions, malware, or device-management tools that can access the profile may read them.
- Clearing site data, resetting the browser profile, private-browsing cleanup, or device loss can delete local records.
- Downloaded backups encrypt their contents with AES-256-GCM and a passphrase-derived key. The format, creation time, salt, and cipher metadata remain visible. There is no passphrase recovery.
- A browser, operating system, backup product, or cloud-synced downloads folder may copy the downloaded backup outside MeterClarity's control.
- Do not use saved readings on a shared or untrusted device. Never submit names, addresses, utility account or meter numbers, barcodes, payment identifiers, credentials, or unredacted bills.

## Reproducible 60-second demo script

[Watch the 59-second synthetic-data private-build demo (WebM)](assets/meterclarity-60-second-demo.webm). It was recorded at 1280×720 from the production build and contains no real bill, account, browser-profile, or personal data.

| Time | Action and narration |
| --- | --- |
| 0–8 s | Open MeterClarity and state that it is a local-first estimate, not an official bill. |
| 8–18 s | Choose electricity or water, then set the provider, billing dates, and billing cycle. |
| 18–32 s | Enter the starting reading, current reading, and observation date; no address, account number, or login is required. |
| 32–42 s | Select **計算本期估算** and show the current estimate plus end-of-cycle forecast range. |
| 42–52 s | Open **估算依據與限制**, then point to the active tariff version and official source links. |
| 52–60 s | Save the reading locally and show the encrypted-backup controls and unencrypted-browser-storage warning. |

Any replacement public-preview recording must follow this script using synthetic readings and must not show a real bill, browser profile, download path, or personal identifier.

## Opt-in discrepancy reports

The future public repository's **Bill difference** issue form is the only planned collection path. It is user-initiated, requires an explicit de-identification confirmation, and is not linked to application telemetry. Reports should contain only provider, tariff plan, dates, usage, optional line-item amounts, app estimate, official total, and the difference.

Assistive-technology evidence and any future de-identified household checks must use the repository's [manual verification procedure](manual-verification.md).
