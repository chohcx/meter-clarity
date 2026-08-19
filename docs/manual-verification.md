# Manual verification

These checks supplement automated tests with observed assistive-technology output or a real billing cycle. Never commit or attach a bill, screenshot, address, name, account or meter number, barcode, payment identifier, or credential.

## Observed screen-reader audit

Record the date, MeterClarity commit, operating system, browser version, screen reader and version, then complete this workflow without a mouse:

1. Reach and switch between electricity and water.
2. Enter billing dates and readings, then calculate an estimate.
3. Confirm the current estimate, forecast, line items, assumptions, errors, and success messages are announced in a useful order.
4. Reach every official source link and the encrypted-backup controls.
5. Export and restore a synthetic-data backup.
6. Record any zoom, browse-mode, and forms-mode coverage that was actually exercised; do not infer it from automated checks.

For each defect, record a GitHub issue URL and whether it blocks the Technical Preview. The observed audit is complete only when the core workflow has been exercised with actual screen-reader output, no blocking defect remains, and the result is added below. A blind-user usability review and a 200% browser-zoom screen-reader pass remain recommended follow-up work; they are not represented by this record.

| Date | Commit | OS / browser | Screen reader | Result | Blocking issues |
| --- | --- | --- | --- | --- | --- |
| 2026-08-19 | `25d2060c025cac03a7adbdaa040257b5d045a431` | Windows 11 / Chromium 151.0.7922.34 | NVDA 2026.1.1, zh-TW, minimal mode | Pass after persistent live-status fix; synthetic data, keyboard-only core flow, standard browser zoom | None |

Sanitized NVDA speech evidence from the passing run:

- “估算完成。目前估算新臺幣 708 元，已使用 350 度電；帳期預測新臺幣 1650 元，範圍新臺幣 1422 至 1916 元。”
- “這次讀值已儲存在此裝置”
- “加密備份已下載”
- “備份已還原”

The run also reached the electricity and water selectors, date and reading fields, assumptions, all three official-source links, and encrypted-backup controls. The first run exposed that a dynamically inserted live region did not announce the estimate or first save notice. Commit `25d2060` keeps one status region mounted and updates its text; a second NVDA run confirmed all four messages above. The raw log is intentionally not committed because it contained unrelated desktop-window text. This was an agent-assisted inspection of actual NVDA I/O, not a blind-user usability study.

## De-identified real-bill validation

Keep source bills outside the repository. Record only the minimum numerical facts needed to reproduce a comparison. Use a random case ID that cannot be linked back to a household.

| Case ID | Provider | Commit | Billing period | Tariff / meter | Usage | User-supplied fees | Estimate | Official total | Difference | Explanation / status |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Pending | — | — | — | — | — | — | — | — | — | Not run |

Validation procedure:

1. Use the exact readings, billing period, plan or meter diameter, and applicable optional line items from the bill.
2. Run the tagged build or commit recorded in the table.
3. Record the estimate and official total in whole New Taiwan dollars.
4. Explain every non-zero difference as rounding, a user-supplied local charge, an unsupported rule, a defect, or an unresolved discrepancy.
5. Open a focused issue for defects or unresolved discrepancies without including the source bill or identifiers.

The Technical Preview has zero real-household cases and does not claim live-bill accuracy. Its pre-public correctness evidence is limited to reproducible official-provider examples. The Stable gate requires at least ten real households across all three supported providers and complete billing cycles.
