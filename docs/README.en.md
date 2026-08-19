# MeterClarity

MeterClarity is a local-first, installable utility usage and cost estimator. It starts with Taiwan household electricity and water while keeping the core model provider-neutral.

This repository is a **v0.1.0 Technical Preview**. It is not affiliated with or endorsed by Taipower, Taiwan Water Corporation, or Taipei Water Department. Estimates are not official bills.

## Supported now

- Taipower residential non-time-of-use tariffs, including seasonal and cross-season billing periods.
- Taiwan Water and Taipei Water base consumption tariffs.
- Manual readings, transparent run-rate forecasts, source provenance, and explicit assumptions.
- Device-local storage, AES-GCM encrypted backups, and offline PWA assets.

Provider login automation, private API reverse engineering, smart-meter hardware, AI forecasts, native apps, and time-of-use electricity tariffs are deliberately out of scope for the technical preview.

## Development

```sh
npm install
npm run dev
npm run check
```

See [architecture.md](architecture.md), [tariffs.md](tariffs.md), and [coverage.md](coverage.md).
