# Security and privacy

The default configuration makes no network request, reads no provider key, and emits no telemetry. The MCP server accepts data and returns data. It never runs shell commands or follows paths found in prompts. The debug CLI reads only the file explicitly provided to it, with a size and regular-file check. The skill contains no executable scripts.

## Trust boundaries

Prompt and context content is untrusted. JSON-encoded context has a separate data label; no caller field can elevate it into system/developer authority. Injection-like content gets diagnostics. Delimiters and pattern detectors are defense in depth, not a sandbox for a model. The host must enforce instruction priority, permissions and execution safety. Model recommendations also remain untrusted.

## Limits and logs

Strict Zod schemas reject unknown fields. Prompt: 64,000 characters. Context: 128 items, 32,000 characters per item, 256,000 total. HTTP and stdio ingress and tool output: 2,000,000 bytes. Providers: 30,000 characters of analyzed input at engine boundary, 64 KiB response body, 8,000 response-text characters, bounded candidate schema. The default provider deadline is 15 seconds per call, with at most five calls and no automatic retries. HTTP allows eight active requests and uses header, request and socket timeouts.

The application never logs prompt/context bodies, authorization headers, keys or provider error responses. Stdio stdout carries protocol messages only. Exceptions use fixed messages. Returned results intentionally contain the redacted request; host logging policies therefore still matter.

Redaction detects common API token formats, bearer credentials, named secret assignments, URL credentials and PEM private keys. Detection is best-effort: arbitrary secrets and personal data may remain. Redaction can change literal examples. Diagnostics disclose recognized redaction, and the host must keep the original securely if needed. Avoid submitting secrets at all.

## Remote assistance

Two gates: trusted server/SDK configuration must allow remote use, and the call must select a non-local mode. Provider URLs, credentials and evaluator settings cannot be supplied through MCP tool arguments. Requests send redacted source, selected context and guidance to the configured provider. Subsequent critique calls can send candidates and redacted source. Data handling and charges are determined by that provider. A configured evaluator can receive source and candidates as well.

URLs require HTTPS, prohibit URL credentials/query strings/fragments, reject known private addresses, and validate DNS answers at the socket lookup that establishes the connection. Redirects are not followed. SDK-only `allowLocalEndpoint` permits deliberately configured loopback services; it is not exposed through tool inputs or environment config. An external API may itself proxy requests; only configure a trusted endpoint. Egress controls remain appropriate for hostile multi-tenant deployments.

## HTTP deployment

v0.1 listens only on `127.0.0.1`. Host must be `localhost:PORT` or `127.0.0.1:PORT`; browser Origin must match one of those origins. No CORS wildcard, public bind flag, OAuth server, or bearer-token gateway is included. Local processes with access to the port can call it. Prefer stdio for isolation by process. Remote deployment is not release-certified: it requires an authenticated TLS gateway, explicit origin/host policy, tenant isolation and request quotas. Do not publish this loopback service directly.

## Installation and supply chain

The skill installer copies only bundled files, rejects existing installations and symlink parents, and does not modify MCP configuration or execute copied scripts. There is no install lifecycle script. Pin reviewed release versions. `prepack` builds and validates the skill for maintainers; consumers do not need build tools.

See [SECURITY.md](../SECURITY.md) for reporting and [compatibility](compatibility.md) for what was actually tested.
