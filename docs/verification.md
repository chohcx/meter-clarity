# Verification record

Last reviewed: 2026-08-19.

## Automated checks

| Check | Result |
| --- | --- |
| TypeScript, 14 unit tests, production/PWA build (`npm run check`) | Pass |
| Six Playwright checks across desktop and mobile Chromium | Pass |
| Automated WCAG 2.0/2.1/2.2 A/AA checks | Pass |
| Five official tariff source probes (`npm run check:tariffs`) | Pass |
| npm dependency audit (`npm audit --audit-level=high`) | 0 vulnerabilities |
| GitHub CI for push and pull request | Pass |

## Automated real-browser checks

The production build is exercised by Playwright in desktop and mobile Chromium:

- Downloaded an AES-GCM backup, changed the current reading, restored the backup, and confirmed both React state and persisted localStorage returned to the exported value.
- Reloaded the controlled PWA while the browser context was offline and confirmed the application shell rendered.
- Confirmed every rendered button, input, select, and link had an accessible name.
- Confirmed the restore control is reachable by keyboard.
- Ran axe-core WCAG checks, including color contrast. The first run found and led to fixes for three low-contrast text elements and a keyboard-inaccessible file input.

## Observed assistive-technology check

On Windows 11, a keyboard-only synthetic-data flow was inspected through actual NVDA 2026.1.1 zh-TW speech I/O in Chromium 151.0.7922.34. The first run found that dynamically inserted live regions did not announce the calculation result or first save notice. Commit `25d2060` introduced one persistent atomic status region. A passing rerun announced the estimate, local save, encrypted-backup download, and restore; no blocking issue remained in the exercised path.

This is an agent-assisted observation of real assistive-technology output, not a blind-user usability study. It does not cover 200% browser zoom. See the sanitized evidence and exact scope in [the manual verification record](manual-verification.md).

## Correctness evidence boundary

Golden tests reproduce public examples from Taipower, Taiwan Water, and Taipei Water. No real-household bill and no complete live billing cycle has been validated yet, so the result supports a Technical Preview only, not a Stable claim.
