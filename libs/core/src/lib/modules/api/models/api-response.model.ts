/**
 * Generic API Result wrapper contract used across HTTP Repositories.
 */
export interface CRUDResult<T = unknown> {
  status: number;
  message: string;
  data: T;
}
