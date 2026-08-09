/**
 * Supported payload types that can be safely broadcasted across Micro-Frontends.
 * Supports Primitives (string, number, boolean), Objects/DTOs, Arrays, Binary Files, and Nullable signals.
 */
export type EventPayloadType =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | unknown[]
  | File
  | Blob
  | ArrayBuffer
  | null
  | undefined;

/**
 * Standard Cross-MFE Event Payload Interface.
 */
export interface MfeEvent<T = EventPayloadType> {
  type: string;
  payload: T;
  sourceRemote: string;
  timestamp: number;
}
