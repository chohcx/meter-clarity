# Security policy

## Reporting

Do not open a public Issue for a vulnerability. Use GitHub's private security advisory form for this repository.

Include affected version, reproduction steps, impact, and suggested mitigation if known. Do not include another person's utility data.

## Security properties

- Utility credentials are never requested or stored.
- There is no automatic telemetry.
- Backups are encrypted in the browser; passphrases are not persisted.
- Imported files are size-limited and must pass schema validation.
- Provider pages are monitored as untrusted input and cannot automatically change tariff code.

Only the latest private build is currently supported. A public support window will be defined before the technical preview.
