import { AuditChain } from "./auditChain.js";
import { hashWithPrefix } from "../lib/hash.js";

export class VesselMonitor {
  constructor({ audit } = {}) {
    this.audit = audit || new AuditChain({ chainId: "AML-VESSEL" });
    this.vessels = new Map();
  }

  heartbeat(vesselId, state, meta = {}) {
    const stateHash = hashWithPrefix("vessel", state);
    const previous = this.vessels.get(vesselId);
    const discrepancy = Boolean(previous) && previous.lastHash !== stateHash;
    const record = {
      vesselId,
      stateHash,
      discrepancy,
      prevHash: previous?.lastHash || null,
      t: new Date().toISOString(),
      meta,
    };

    this.vessels.set(vesselId, { lastHash: stateHash, lastSeen: record.t, meta });
    this.audit.append({ type: "VESSEL_HEARTBEAT", record });
    return record;
  }
}
