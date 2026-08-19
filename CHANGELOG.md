# Changelog

All notable changes to the private rebuild will be documented here.

## Unreleased

- Renamed the private repository to MeterClarity while preserving legacy history.
- Archived the unpublished water/electricity splitter prototype.
- Rebuilt the application as a TypeScript, React, Vite PWA.
- Added exact scaled-integer tariff calculations for Taipower, Taiwan Water, and Taipei Water.
- Added official golden examples, local persistence, encrypted backups, offline assets, CI, and tariff source monitoring.
- Added deep backup-state validation and rejected estimates outside each bundled tariff's effective period.
- Added desktop/mobile Playwright coverage for encrypted restore, offline use, keyboard access, and WCAG checks; fixed the issues found by the first run.
- Added a complete Taiwan Water official sample-bill fixture and independently monitored its source page.
- Added Technical Preview disclosures, a reproducible 60-second demo script, explicit local-storage risks, and a privacy-gated discrepancy form.
