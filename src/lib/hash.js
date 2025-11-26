const canonical = (value) =>
  typeof value === "string" ? value : JSON.stringify(value, Object.keys(value || {}).sort());

export function weakHash(value) {
  const str = canonical(value);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `weak-${Math.abs(hash)}`;
}

export function hashWithPrefix(prefix, payload) {
  return `${prefix}-${weakHash(payload)}`;
}
