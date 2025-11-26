export class RiskScorer {
  constructor({ weights = {} } = {}) {
    this.weights = {
      kycIncomplete: 30,
      pepMatch: 40,
      sanctionsMatch: 100,
      highRiskGeo: 25,
      txnVelocity: 20,
      structuringPattern: 35,
      mixerExposure: 50,
      vesselDiscrepancy: 60,
      authorityDiscrepancy: 60,
      manualFlag: 50,
      ...weights,
    };
  }

  scoreUser(user) {
    let score = 0;
    const reasons = [];

    if (!user.kyc?.verified) {
      score += this.weights.kycIncomplete;
      reasons.push("KYC_INCOMPLETE");
    }
    if (user.matches?.pep) {
      score += this.weights.pepMatch;
      reasons.push("PEP_MATCH");
    }
    if (user.matches?.sanctions) {
      score += this.weights.sanctionsMatch;
      reasons.push("SANCTIONS_MATCH");
    }
    if (user.geo?.riskLevel === "HIGH") {
      score += this.weights.highRiskGeo;
      reasons.push("HIGH_RISK_GEO");
    }
    if (user.flags?.manual) {
      score += this.weights.manualFlag;
      reasons.push("MANUAL_FLAG");
    }

    return { score, reasons };
  }

  scoreTransaction(txn, ctx = {}) {
    let score = 0;
    const reasons = [];

    if (ctx.velocity?.isHigh) {
      score += this.weights.txnVelocity;
      reasons.push("TXN_VELOCITY_HIGH");
    }
    if (ctx.patterns?.structuring) {
      score += this.weights.structuringPattern;
      reasons.push("STRUCTURING_PATTERN");
    }
    if (ctx.exposure?.mixer) {
      score += this.weights.mixerExposure;
      reasons.push("MIXER_EXPOSURE");
    }
    if (ctx.vessel?.discrepancy) {
      score += this.weights.vesselDiscrepancy;
      reasons.push("VESSEL_DISCREPANCY");
    }
    if (ctx.authority?.discrepancy) {
      score += this.weights.authorityDiscrepancy;
      reasons.push("AUTHORITY_DISCREPANCY");
    }

    return { score, reasons };
  }
}
