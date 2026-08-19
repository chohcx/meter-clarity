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
- Taiwan Water: official two-month 110 m³ usage-charge example; MeterClarity rounds NT$1,107.75 to its whole-NTD line item of NT$1,108.
- Taiwan Water: complete official sample bill for 46 m³ and a 20 mm meter. The provider shows NT$392.70 usage, NT$71.40 basic fee, NT$126 cleanup charge, NT$19 conservation charge, a NT$5 e-bill rebate, and a NT$604 total. MeterClarity represents the provider-specific cleanup charge and rebate as a user-supplied net NT$121 other charge.

Taiwan Water also has a complete meter-fee-table regression test and billing-cycle tests. Its meter fees, usage rates, and sample-bill page are monitored independently.
