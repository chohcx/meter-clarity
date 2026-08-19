# Contributing

MeterClarity is private during the rebuild. These rules already apply so the future public history starts cleanly.

1. Open an Issue before a broad feature or provider addition.
2. Keep the framework-free core independent from React and provider APIs.
3. Add an official source, effective date, and test for every tariff change.
4. Run `npm run check` before submitting a PR.
5. Never commit real names, addresses, meter/account numbers, credentials, barcodes, or unredacted bills.

Small, focused changes are preferred. New abstractions need at least two real consumers; speculative adapters belong in the roadmap, not the core.
