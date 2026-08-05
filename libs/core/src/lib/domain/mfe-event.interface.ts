export interface MfeEvent<T = any> {
  type: string;
  payload: T;
  sourceRemote: string;
  timestamp: number;
}
