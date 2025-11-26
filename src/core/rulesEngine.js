export class RulesEngine {
  constructor({ rules = [] } = {}) {
    this.rules = rules.slice();
  }

  addRule(rule) {
    if (!rule?.id || typeof rule.evaluate !== "function") {
      throw new Error("Rule must have an id and an evaluate(context) function");
    }
    this.rules.push(rule);
  }

  evaluate(context) {
    const hits = [];
    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      if (result?.hit) {
        hits.push({ id: rule.id, ...(result.reason ? { reason: result.reason } : {}), weight: result.weight || 0 });
      }
    }
    return hits;
  }
}
