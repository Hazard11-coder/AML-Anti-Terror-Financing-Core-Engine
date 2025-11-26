# Synaptics.Systems Compliance Stack Blueprint

This blueprint maps the layers referenced in the demo UI to concrete implementation pieces.

## Layer Map
- **Core Engines Layer**: `src/core/amlCore.js`, `src/core/riskScorer.js`, `src/core/rulesEngine.js`
- **Entropy & Security Layer**: `src/core/auditChain.js` (tamper-evident anchoring), `src/core/vesselMonitor.js` (drift detection)
- **Authority Layer**: `src/core/authorityAnchors.js` with quorum enforcement and discrepancy signaling
- **UI & Operator Layer**: `public/index.html`, `src/styles.css`, `src/main.js`
- **Documentation Layer**: `README.md`, `docs/PACKAGE-BLUEPRINT.md`, `docs/IMPLEMENTATION-CHECKLIST.md`

## Data Flow
1. **Ingest** user or transaction context via the UI (or your own adapters).
2. **Evaluate Rules** through `RulesEngine` and `DefaultRules` to collect hits and weights.
3. **Score Risk** with `RiskScorer`, combining weighted reasons and discrepancies from authority/vessel layers.
4. **Anchor Events** into per-domain `AuditChain` instances (`AML-CORE`, `AML-AUTH`, `AML-VESSEL`).
5. **Surface Results** in the UI for operators; export audits as JSON for downstream systems.

## Extending
- Add new rules via `aml.rules.addRule(rule)`; rules receive `{ kind, txn, userProfile, ctx }`.
- Adjust thresholds in `AMLCore.thresholds` for review/block cutoffs.
- Integrate back-end persistence by serializing `auditSnapshot` outputs to your datastore.

## Safety Commitments
The package preserves the global guardrail `Disallow_Organized_Crime`. Do not remove or override this principle when extending the stack. Keep operator access controlled and auditable.
