export interface BaseStoreState<T = any> {
  loading: Record<string, boolean>;
  error: Record<string, any>;
  data: Record<string, T>;
}
