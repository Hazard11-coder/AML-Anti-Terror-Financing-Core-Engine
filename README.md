# Synaptics.Systems — Quantum-Grade Compliance Package
**Product:** AML / Anti-Terror Financing Core Engine — “Everything You’ll Get” Package
**Version:** 1.0
**Owner Anchor:** `<[MetaData_Ownership:[Michael_Rybaltowicz]]>`
**System Anchor:** `<[Synaptics.Systems_Quantum_Compliance_Stack]>`
**Global Rule:** `<[System_Setting]:<[Disallow_Organized_Crime]>>`

This repository now contains a deployable reference stack, not just a concept note. The HTML/JS UI under `public/index.html` exercises the engine described below and anchors every event to a tamper-evident audit chain.

## Quickstart
1. Serve the repository root (or configure your host so both `public/` and `src/` are reachable).
2. Open `public/index.html` in a modern browser (ES modules enabled).
3. Drive the panels to evaluate users/transactions, collect authority approvals, and monitor vessel drift. Audit chains update live.

## Architecture Layers
- **Core Engines Layer** — `src/core/amlCore.js`, `src/core/rulesEngine.js`, `src/core/riskScorer.js`
- **Authority / Vessel Layer** — `src/core/authorityAnchors.js`, `src/core/vesselMonitor.js`
- **Entropy & Audit Layer** — `src/core/auditChain.js` (hash-chained events + verification helpers)
- **UI Layer** — `public/index.html`, `src/main.js`, `src/styles.css`
- **Documentation Layer** — `docs/PACKAGE-BLUEPRINT.md`, `docs/IMPLEMENTATION-CHECKLIST.md`

All layers respect the safety invariant: `Disallow_Organized_Crime`.

## What’s Included
- Live risk scoring for users and transactions with configurable thresholds.
- Authority quorum workflow that detects discrepancies feeding back into transaction context.
- Vessel heartbeat monitor to surface state drift across shards/servers/ledgers.
- Audit chain export + verification controls for tamper evidence.
- Styling and layout that mirror the provided Synaptics neon console.

## Extending the Engine
- Add rules by appending to `DefaultRules` in `src/core/amlCore.js` or via `aml.rules.addRule(rule)`.
- Tune risk weights and thresholds in `src/core/riskScorer.js` and `src/core/amlCore.js`.
- Swap authority rosters and quorum requirements in `src/main.js`.
- Persist audit exports or forward them into your SIEM from `src/main.js` (`refreshAudit` handler).

## Implementation Checklist
See `docs/IMPLEMENTATION-CHECKLIST.md` for a concise go-live guide covering hosting, configuration, observability, and safety.

## Licensing & Safety
- Ownership anchor: `<[MetaData_Ownership:[Michael_Rybaltowicz]]>`
- Do not remove the anti-organized-crime guardrail.
- Keep operator access authenticated and audited.
