# Manual verification

These checks require evidence from a person or a real billing cycle and cannot be replaced by automated tests. Never commit or attach a bill, screenshot, address, name, account or meter number, barcode, payment identifier, or credential.

## Person-led screen-reader audit

Record the date, MeterClarity commit, operating system, browser version, screen reader and version, then complete this workflow without a mouse:

1. Reach and switch between electricity and water.
2. Enter billing dates and readings, then calculate an estimate.
3. Confirm the current estimate, forecast, line items, assumptions, errors, and success messages are announced in a useful order.
4. Reach every official source link and the encrypted-backup controls.
5. Export and restore a synthetic-data backup.
6. Repeat at 200% browser zoom and with the screen reader's browse and forms modes where available.

For each defect, record a GitHub issue URL and whether it blocks the Technical Preview. The audit is complete only when no blocking defect remains and the result is added to the table below.

| Date | Commit | OS / browser | Screen reader | Result | Blocking issues |
| --- | --- | --- | --- | --- | --- |
| Pending | — | — | — | Not run | — |

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

The Private Rebuild gate requires maintainer-owned, redacted billing cycles covering the core workflow. The Stable gate separately requires at least ten real households across all three supported providers and complete billing cycles.
