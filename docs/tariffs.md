# Tariff maintenance

Tariff code is treated like financial logic.

1. The weekly monitor verifies official pages still contain the expected effective dates and rate markers.
2. A failed check opens one review issue; it never changes production rates.
3. The maintainer compares the official source, records the effective date, and adds a new immutable tariff version.
4. Official examples or de-identified reproducible cases become golden tests.
5. `npm run check` must pass before merge and release.

Every tariff source records its URL and retrieval date. A provider's website text is evidence, not executable configuration.

## Current golden tests

- Taipower: official 350 kWh example for 13 September through 11 November, including 18 summer and 42 non-summer days.
- Taipei Water: official monthly example for 25 m³, a 20 mm meter, and NT$5/m³ sewer charge; expected total NT$340.

Taiwan Water currently has rate-vector and billing-cycle tests. A provider-published complete household example is still required before public preview.
