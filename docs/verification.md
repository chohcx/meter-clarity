# Verification record

Last reviewed: 2026-08-19.

## Automated checks

| Check | Result |
| --- | --- |
| TypeScript, 11 unit tests, production/PWA build (`npm run check`) | Pass |
| Three official tariff source probes (`npm run check:tariffs`) | Pass |
| npm dependency audit (`npm audit --audit-level=high`) | 0 vulnerabilities |
| GitHub CI for push and pull request | Pass |

## Real-browser checks

The production build was served locally and exercised in headless desktop Chrome:

- Downloaded an AES-GCM backup, changed the current reading, restored the backup, and confirmed both React state and persisted localStorage returned to the exported value.
- Reloaded the controlled PWA while the browser context was offline and confirmed the application shell rendered.
- Confirmed every rendered button, input, select, and link had an accessible name.
- Confirmed keyboard focus moved away from the document body and no console errors occurred.

This is a recorded browser verification, not yet a committed automated end-to-end suite. Screen-reader behavior, contrast, mobile keyboard flow, and automated restore migration coverage remain open before the Technical Preview.
