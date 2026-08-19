# Architecture

```text
React PWA
   │
   ├── app/              local persistence, encrypted backup, user workflow
   ├── packs/tw/         versioned Taiwan tariff rules and official sources
   └── core/             framework-free money, dates, progressive tiers, forecast
          │
          └── future adapters (file import, Home Assistant/MQTT, provider APIs)
```

The browser does not connect directly to utility meters and never stores utility credentials. Future LAN protocols require an optional local gateway; future provider access requires an authorized connector.

## Canonical boundaries

- **Observation**: a reading with observed/received timestamps, unit, source, and quality.
- **TariffVersion**: immutable rules, effective range, jurisdiction, and official sources.
- **OfficialBill**: a settled provider total and line items.
- **BillEstimate**: a reproducible calculation with as-of time and assumptions.

These are separate on purpose. A recent sensor reading is not an official bill, and a published tariff does not grant access to a household meter.

## Money and time

Rates and usage are converted to scaled integers before multiplication. Intermediate charges use integer micro-NTD values; binary floating point is not used for tariff multiplication. Dates are parsed as date-only UTC values so daylight-saving or host timezone changes cannot alter inclusive day counts.

## Data flow

Application state is versioned (`schemaVersion: 1`) and stored locally. Export derives an AES-256-GCM key with PBKDF2-SHA-256 and a random salt. The passphrase is never persisted.
