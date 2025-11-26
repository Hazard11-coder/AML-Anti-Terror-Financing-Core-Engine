import { hashWithPrefix } from "../lib/hash.js";

export class AuditChain {
  constructor({ chainId = "AML-AUDIT", salt = "" } = {}) {
    this.chainId = chainId;
    this.salt = salt;
    this.events = [];
    this.tip = hashWithPrefix("genesis", { chainId, salt, genesis: true });
  }

  append(event) {
    const record = {
      id: hashWithPrefix("evt", {
        event,
        prev: this.tip,
        t: new Date().toISOString(),
        salt: this.salt,
      }),
      t: new Date().toISOString(),
      prev: this.tip,
      chainId: this.chainId,
      event,
    };

    this.events.push(record);
    this.tip = record.id;
    return record;
  }

  verify() {
    let cursor = hashWithPrefix("genesis", { chainId: this.chainId, salt: this.salt, genesis: true });
    for (const record of this.events) {
      const expected = hashWithPrefix("evt", {
        event: record.event,
        prev: cursor,
        t: record.t,
        salt: this.salt,
      });
      if (expected !== record.id) return false;
      cursor = record.id;
    }
    return true;
  }

  export() {
    return { chainId: this.chainId, tip: this.tip, events: [...this.events] };
  }
}

export const auditSnapshot = (chain) => ({ ok: chain.verify(), chain: chain.export() });
