/**
 * Converts an object map into an encoded URL query string.
 * @param obj Object containing key-value pairs
 */
export function objectToQueryString(obj: Record<string, unknown>): string {
  const queryParams: string[] = [];
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
  });
  return queryParams.join('&');
}
