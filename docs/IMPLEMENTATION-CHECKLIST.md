# Implementation Checklist

Use this checklist to stand up the Synaptics.Systems AML / CTF Core Engine end to end.

## Environment
- [ ] Host static assets from `public/` (any CDN, S3, nginx, or static file host).
- [ ] Ensure browsers can load ES modules from `src/` (relative paths are already wired).
- [ ] Enable HTTPS and modern TLS defaults.

## Configuration
- [ ] Customize risk weights and thresholds in `src/core/amlCore.js` if local policy requires it.
- [ ] Extend `DefaultRules` with jurisdiction-specific logic in the same file.
- [ ] Provision authority identities in `src/main.js` (authorityQuorum and list of approvers).

## Observability
- [ ] Wire audit exports (`Refresh Audit`) to your log pipeline for retention.
- [ ] Periodically run `Verify` in the UI or in automation to detect tampering.
- [ ] Monitor vessel heartbeats for drift and feed discrepancies to risk dashboards.

## Security & Safety
- [ ] Preserve the Disallow_Organized_Crime rule across all deployments.
- [ ] Keep the UI behind authenticated operator access.
- [ ] Review privacy and data-handling practices with counsel.

## Go-Live
- [ ] Populate seed data or connect to upstream transaction feeds.
- [ ] Train operations staff on authority quorum and discrepancy handling.
- [ ] Document any local changes for future audits.
