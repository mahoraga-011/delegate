import { keccak256, toHex } from "viem";

/**
 * Canonical JSON stringify with sorted keys.
 * Ensures deterministic serialization regardless of object key insertion order.
 */
export function canonicalize(obj: unknown): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalize).join(",") + "]";
  }

  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const entries = sorted.map(
    (key) => `${JSON.stringify(key)}:${canonicalize((obj as Record<string, unknown>)[key])}`
  );
  return "{" + entries.join(",") + "}";
}

/**
 * Hash an object using canonical JSON → keccak256.
 * Returns a bytes32 hex string.
 */
export function hashObject(obj: unknown): `0x${string}` {
  const canonical = canonicalize(obj);
  return keccak256(toHex(canonical));
}
