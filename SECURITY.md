# Security policy

v0.1.x is the currently maintained line. Report vulnerabilities privately using the repository's Security → Report a vulnerability feature after the maintainer enables private vulnerability reporting. This checkout has no assigned remote owner or private reporting address yet. Until that channel is configured, do not put exploit details, credentials or sensitive prompts into a public issue; contact the distributing maintainer privately. Configuring that channel is a publication prerequisite.

Include the affected version, transport, a minimal sanitized reproduction, expected/observed behavior and impact. Never attach API keys, authorization headers, production context or private prompt logs. Maintainers should acknowledge reports promptly, coordinate remediation and publish an advisory with the fix.

Prompts and context are untrusted data. The optimizer cannot override host instructions or grant execution permissions. Secret redaction is best-effort, and provider modes may transmit remaining data to the configured service. Credentials belong in the trusted server environment, not prompts or checked-in config. Local HTTP is loopback-only; internet-facing deployment requires separate authentication and transport hardening.

The bundled skill is instruction-only. Audit third-party skills and scripts before running them. There is no telemetry or persistent prompt history. See [the threat model and limits](docs/security.md).
