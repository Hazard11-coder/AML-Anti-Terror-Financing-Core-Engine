import { AuditChain } from "./auditChain.js";
import { hashWithPrefix } from "../lib/hash.js";

export class AuthorityAnchors {
  constructor({ quorum = 2, authorities = [], audit } = {}) {
    this.quorum = quorum;
    this.authorities = new Map(authorities.map((a) => [a.id, { ...a }]));
    this.audit = audit || new AuditChain({ chainId: "AML-AUTH" });
    this.pending = new Map();
  }

  proposeAction(action) {
    const actionId = hashWithPrefix("action", { action, t: Date.now() });
    this.pending.set(actionId, { actionId, action, approvals: new Map(), createdAt: new Date().toISOString() });
    this.audit.append({ type: "ACTION_PROPOSED", actionId, action });
    return actionId;
  }

  approve(actionId, authorityId, decision, meta = {}) {
    const pending = this.pending.get(actionId);
    const authority = this.authorities.get(authorityId);
    if (!pending) throw new Error("Unknown actionId");
    if (!authority || !authority.active) throw new Error("Inactive or unknown authority");
    if (!["APPROVE", "REJECT"].includes(decision)) throw new Error("Decision must be APPROVE or REJECT");

    const approvalRecord = {
      authorityId,
      decision,
      meta,
      t: new Date().toISOString(),
      anchor: hashWithPrefix("approval", { actionId, authorityId, decision, meta, prev: this.audit.tip }),
    };

    pending.approvals.set(authorityId, approvalRecord);
    this.audit.append({ type: "ACTION_APPROVAL", actionId, approvalRecord });
    return approvalRecord;
  }

  resolve(actionId) {
    const pending = this.pending.get(actionId);
    if (!pending) throw new Error("Unknown actionId");
    const approvals = [...pending.approvals.values()];
    const approves = approvals.filter((a) => a.decision === "APPROVE");
    const rejects = approvals.filter((a) => a.decision === "REJECT");

    const discrepancy = rejects.length > 0 && approves.length > 0;
    const quorumMet = approves.length >= this.quorum;
    const rejected = rejects.length >= this.quorum;
    const status = rejected ? "REJECTED" : quorumMet ? "APPROVED" : "PENDING";

    const resolution = {
      actionId,
      status,
      discrepancy,
      approves: approves.length,
      rejects: rejects.length,
      quorum: this.quorum,
    };
    this.audit.append({ type: "ACTION_RESOLVED", resolution });
    if (status !== "PENDING") this.pending.delete(actionId);
    return resolution;
  }
}
