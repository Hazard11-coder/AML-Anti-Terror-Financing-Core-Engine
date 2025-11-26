import { AMLCore, DefaultRules } from "./core/amlCore.js";
import { auditSnapshot } from "./core/auditChain.js";

const aml = new AMLCore({
  rules: DefaultRules,
  authorityQuorum: 2,
  authorities: [
    { id: "authA", role: "COMPLIANCE_OFFICER", active: true },
    { id: "authB", role: "RISK_OFFICER", active: true },
    { id: "authC", role: "SECURITY", active: true },
  ],
});

const stats = { users: 0, txns: 0, flags: 0 };
let currentActionId = null;
let lastAuthorityDiscrepancy = false;
let lastVesselDiscrepancy = false;

const $ = (id) => document.getElementById(id);
const pretty = (obj) => JSON.stringify(obj, null, 2);

function bumpKPIs() {
  $("kpiUsers").textContent = stats.users;
  $("kpiTxns").textContent = stats.txns;
  $("kpiFlags").textContent = stats.flags;
}

function runUserCheck() {
  const user = {
    id: $("userId").value.trim(),
    kyc: { verified: $("kycVerified").value === "true" },
    matches: { pep: $("pepMatch").value === "true", sanctions: $("sanctionsMatch").value === "true" },
    geo: { riskLevel: $("geoRisk").value },
    flags: {},
  };
  const ctx = { intent: $("userIntent").value };
  const result = aml.evaluateUser(user, ctx);
  stats.users += 1;
  if (result.disposition !== "PASS") stats.flags += 1;
  bumpKPIs();
  $("userOut").textContent = pretty(result);
}

function clearUser() {
  $("userId").value = "u1";
  $("kycVerified").value = "false";
  $("geoRisk").value = "LOW";
  $("pepMatch").value = "false";
  $("sanctionsMatch").value = "false";
  $("userIntent").value = "WITHDRAW";
  $("userOut").textContent = "Awaiting user evaluation…";
}

function runTxnCheck() {
  const txn = {
    id: $("txnId").value.trim(),
    userId: $("userId").value.trim(),
    amount: Number($("txnAmount").value || 0),
    assetType: $("assetType").value,
  };
  const ctx = {
    velocity: { isHigh: $("velHigh").value === "true" },
    patterns: { structuring: $("structuring").value === "true" },
    exposure: { mixer: $("mixerExp").value === "true" },
    vessel: { discrepancy: lastVesselDiscrepancy },
    authority: { discrepancy: lastAuthorityDiscrepancy },
  };
  const result = aml.evaluateTransaction(txn, ctx);
  stats.txns += 1;
  if (result.disposition !== "PASS") stats.flags += 1;
  bumpKPIs();
  $("txnOut").textContent = pretty(result);
}

function clearTxn() {
  $("txnId").value = "t1";
  $("txnAmount").value = "12000";
  $("assetType").value = "UNHOSTED_WALLET";
  $("velHigh").value = "false";
  $("structuring").value = "false";
  $("mixerExp").value = "false";
  $("txnOut").textContent = "Awaiting transaction evaluation…";
}

function proposeAction() {
  let meta = {};
  try {
    meta = JSON.parse($("actionMeta").value || "{}");
  } catch (e) {
    $("authOut").textContent = `Invalid action meta: ${e.message}`;
    return;
  }
  const action = { type: $("actionType").value, userId: $("actionUser").value.trim(), meta };
  currentActionId = aml.authority.proposeAction(action);
  lastAuthorityDiscrepancy = false;
  $("discrepBadge").className = "status warn";
  $("discrepBadge").textContent = "PENDING ACTION";
  $("authOut").textContent = `Action proposed (id: ${currentActionId})\n\n${pretty(action)}`;
}

function submitApproval() {
  if (!currentActionId) {
    $("authOut").textContent = "No pending action. Propose one first.";
    return;
  }
  const authId = $("authId").value;
  const decision = $("authDecision").value;
  const note = $("authNote").value.trim();
  try {
    const record = aml.authority.approve(currentActionId, authId, decision, { note });
    const pending = aml.authority.pending.get(currentActionId);
    const approvals = [...pending.approvals.values()];
    $("authOut").textContent = `Approval recorded:\n${pretty(record)}\n\nCurrent approvals:\n${pretty(
      approvals,
    )}`;
  } catch (e) {
    $("authOut").textContent = `Error: ${e.message}`;
  }
}

function resolveAction() {
  if (!currentActionId) {
    $("authOut").textContent = "No pending action.";
    return;
  }
  const resolution = aml.authority.resolve(currentActionId);
  lastAuthorityDiscrepancy = resolution.discrepancy;

  $("discrepBadge").className = resolution.discrepancy ? "status bad" : "status ok";
  $("discrepBadge").textContent = resolution.discrepancy ? "AUTHORITY DISCREPANCY" : "AUTHORITY CONSENSUS";
  $("authOut").textContent = `Resolution:\n${pretty(resolution)}`;
  if (resolution.status !== "PENDING") currentActionId = null;
}

function clearAuth() {
  currentActionId = null;
  lastAuthorityDiscrepancy = false;
  $("authNote").value = "";
  $("authOut").textContent = "No pending action.";
  $("discrepBadge").className = "status warn";
  $("discrepBadge").textContent = "NO ACTIONS YET";
}

function heartbeat() {
  const vesselId = $("vesselId").value.trim();
  let state = {};
  try {
    state = JSON.parse($("vesselState").value || "{}");
  } catch (e) {
    $("vesselOut").textContent = `Invalid JSON: ${e.message}`;
    return;
  }
  const record = aml.vessel.heartbeat(vesselId, state);
  lastVesselDiscrepancy = record.discrepancy;
  $("vesselOut").textContent = `Heartbeat recorded:\n${pretty(record)}\n\nVessel drift contributes to AML risk scoring.`;
}

function clearVessel() {
  $("vesselId").value = "api-1";
  $("vesselState").value = '{ "ledgerTip":"abc", "balances":{"u1":100} }';
  $("vesselOut").textContent = "No vessel heartbeats yet.";
  lastVesselDiscrepancy = false;
}

function refreshAudit() {
  const bundle = {
    core: auditSnapshot(aml.audit),
    authority: auditSnapshot(aml.authority.audit),
    vessel: auditSnapshot(aml.vessel.audit),
  };
  $("auditOut").textContent = pretty(bundle);
}

function verifyAudit() {
  const ok = {
    core: aml.audit.verify(),
    authority: aml.authority.audit.verify(),
    vessel: aml.vessel.audit.verify(),
  };
  $("auditOut").textContent = `Audit verification:\n${pretty(ok)}`;
}

function bindUI() {
  $("runUser").onclick = runUserCheck;
  $("clearUser").onclick = clearUser;
  $("runTxn").onclick = runTxnCheck;
  $("clearTxn").onclick = clearTxn;
  $("proposeAction").onclick = proposeAction;
  $("submitApproval").onclick = submitApproval;
  $("resolveAction").onclick = resolveAction;
  $("clearAuth").onclick = clearAuth;
  $("heartbeat").onclick = heartbeat;
  $("clearVessel").onclick = clearVessel;
  $("refreshAudit").onclick = refreshAudit;
  $("verifyAudit").onclick = verifyAudit;
}

bindUI();
refreshAudit();
