# Changelog

All notable MeterClarity changes will be documented here.

## Unreleased

- Added a dependency-free Windows launcher that builds the production app and opens it in the default browser.
- Added an official GitHub Pages workflow and project-site-safe PWA asset paths.

## 0.1.0 Technical Preview - 2026-08-19

- Renamed the private repository to MeterClarity while preserving legacy history.
- Archived the unpublished water/electricity splitter prototype.
- Rebuilt the application as a TypeScript, React, Vite PWA.
- Added exact scaled-integer tariff calculations for Taipower, Taiwan Water, and Taipei Water.
- Added official golden examples, local persistence, encrypted backups, offline assets, CI, and tariff source monitoring.
- Added deep backup-state validation and rejected estimates outside each bundled tariff's effective period.
- Added desktop/mobile Playwright coverage for encrypted restore, offline use, keyboard access, and WCAG checks; fixed the issues found by the first run.
- Added a complete Taiwan Water official sample-bill fixture and independently monitored its source page.
- Added Technical Preview disclosures, a reproducible 60-second demo script, explicit local-storage risks, and a privacy-gated discrepancy form.
- Added person-led screen-reader and de-identified real-bill verification procedures.
- Added a verified 59-second private-build demo using synthetic readings and no personal data.
- Fixed calculation and save announcements with a persistent live-status region after an observed NVDA run exposed the defect; the passing rerun also announced backup download and restore.
- Recorded the Technical Preview evidence boundary: official public examples for all three providers, with zero real-household cases or complete live billing cycles.
