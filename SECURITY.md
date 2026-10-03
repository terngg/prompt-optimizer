# Security policy

v0.1.x is the currently maintained line. Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/terngg/prompt-optimizer/security/advisories/new). If that channel is unavailable, contact the maintainer at albinghx@gmail.com. Do not post exploit details, credentials or sensitive prompts in a public issue.

Include the affected version, transport, a minimal sanitized reproduction, expected/observed behavior and impact. Never attach API keys, authorization headers, production context or private prompt logs. Maintainers should acknowledge reports promptly, coordinate remediation and publish an advisory with the fix.

Prompts and context are untrusted data. The optimizer cannot override host instructions or grant execution permissions. Secret redaction is best-effort, and provider modes may transmit remaining data to the configured service. Credentials belong in the trusted server environment, not prompts or checked-in config. Local HTTP is loopback-only; internet-facing deployment requires separate authentication and transport hardening.

The bundled skill is instruction-only. Audit third-party skills and scripts before running them. There is no telemetry or persistent prompt history. See [the threat model and limits](docs/security.md).
