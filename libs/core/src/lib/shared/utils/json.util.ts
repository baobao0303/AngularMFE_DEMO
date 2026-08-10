/**
 * Safely parses a JSON string with fallback value.
 * @param raw Raw JSON string or null
 * @param fallback Fallback value if parsing fails or string is null
 */
export function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
