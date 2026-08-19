# Verification record

Last reviewed: 2026-08-19.

## Automated checks

| Check | Result |
| --- | --- |
| TypeScript, 13 unit tests, production/PWA build (`npm run check`) | Pass |
| Six Playwright checks across desktop and mobile Chromium | Pass |
| Automated WCAG 2.0/2.1/2.2 A/AA checks | Pass |
| Four official tariff source probes (`npm run check:tariffs`) | Pass |
| npm dependency audit (`npm audit --audit-level=high`) | 0 vulnerabilities |
| GitHub CI for push and pull request | Pass |

## Automated real-browser checks

The production build is exercised by Playwright in desktop and mobile Chromium:

- Downloaded an AES-GCM backup, changed the current reading, restored the backup, and confirmed both React state and persisted localStorage returned to the exported value.
- Reloaded the controlled PWA while the browser context was offline and confirmed the application shell rendered.
- Confirmed every rendered button, input, select, and link had an accessible name.
- Confirmed the restore control is reachable by keyboard.
- Ran axe-core WCAG checks, including color contrast. The first run found and led to fixes for three low-contrast text elements and a keyboard-inaccessible file input.

A manual screen-reader session remains open before the Technical Preview; automated accessibility checks do not replace assistive-technology testing by a person.
