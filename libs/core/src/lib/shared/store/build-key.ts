export interface KeyOptions {
  feature?: string;
  scope?: string;
  device?: string;
  [key: string]: any;
}

export function buildKey(options: string | KeyOptions): string {
  if (typeof options === 'string') {
    return options;
  }
  if (!options || typeof options !== 'object') {
    return 'default';
  }
  const { feature, scope, device, ...rest } = options;
  const parts = [feature, scope, device].filter(Boolean);
  if (Object.keys(rest).length > 0) {
    parts.push(JSON.stringify(rest));
  }
  return parts.join(':') || 'default';
}
