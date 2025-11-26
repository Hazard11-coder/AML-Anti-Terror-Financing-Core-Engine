import { AuditChain } from "./auditChain.js";
import { RulesEngine } from "./rulesEngine.js";
import { RiskScorer } from "./riskScorer.js";
import { AuthorityAnchors } from "./authorityAnchors.js";
import { VesselMonitor } from "./vesselMonitor.js";

export class AMLCore {
  constructor({ rules = [], riskWeights = {}, authorities = [], authorityQuorum = 2 } = {}) {
    this.audit = new AuditChain({ chainId: "AML-CORE" });
    this.rules = new RulesEngine({ rules });
    this.scorer = new RiskScorer({ weights: riskWeights });
    this.authority = new AuthorityAnchors({
      quorum: authorityQuorum,
      authorities,
      audit: new AuditChain({ chainId: "AML-AUTH" }),
    });
    this.vessel = new VesselMonitor({ audit: new AuditChain({ chainId: "AML-VESSEL" }) });
    this.thresholds = { userReview: 40, txnReview: 50, txnBlock: 80 };
  }

  evaluateUser(user, ctx = {}) {
    const ruleHits = this.rules.evaluate({ kind: "USER", userProfile: user, ctx });
    const { score, reasons } = this.scorer.scoreUser(user);
    const risk = score + ruleHits.reduce((sum, hit) => sum + hit.weight, 0);
    const disposition = risk >= this.thresholds.userReview ? "REVIEW" : "PASS";
    const result = { risk, reasons, ruleHits, disposition };
    this.audit.append({ type: "USER_EVALUATED", userId: user.id, result });
    return result;
  }

  evaluateTransaction(txn, ctx = {}) {
    const ruleHits = this.rules.evaluate({ kind: "TXN", txn, ctx });
    const { score, reasons } = this.scorer.scoreTransaction(txn, ctx);
    const risk = score + ruleHits.reduce((sum, hit) => sum + hit.weight, 0);
    const disposition =
      risk >= this.thresholds.txnBlock ? "BLOCK" : risk >= this.thresholds.txnReview ? "REVIEW" : "PASS";
    const result = { risk, reasons, ruleHits, disposition };
    this.audit.append({ type: "TXN_EVALUATED", txnId: txn.id, result });
    return result;
  }
}

export const DefaultRules = [
  {
    id: "RULE_LARGE_TXN_REVIEW",
    evaluate({ kind, txn }) {
      if (kind !== "TXN") return { hit: false };
      const amount = Number(txn.amount || 0);
      return amount >= 10000 ? { hit: true, weight: 25, reason: "LARGE_TXN" } : { hit: false };
    },
  },
  {
    id: "RULE_HIGH_RISK_ASSET",
    evaluate({ kind, txn }) {
      if (kind !== "TXN") return { hit: false };
      return ["PRIVACY_COIN", "UNHOSTED_WALLET"].includes(txn.assetType)
        ? { hit: true, weight: 20, reason: "HIGH_RISK_ASSET" }
        : { hit: false };
    },
  },
  {
    id: "RULE_KYC_REQUIRED_FOR_WITHDRAW",
    evaluate({ kind, userProfile, ctx }) {
      if (kind !== "USER") return { hit: false };
      if (ctx.intent === "WITHDRAW" && !userProfile.kyc?.verified) {
        return { hit: true, weight: 35, reason: "KYC_REQUIRED" };
      }
      return { hit: false };
    },
  },
];
