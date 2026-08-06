import { Injectable } from '@angular/core';

/**
 * Abstract contract for Browser Storage operations across Micro-Frontends.
 */
@Injectable()
export abstract class BaseStorageService {
  /**
   * Retrieves an item from browser storage.
   * @param key Storage key
   */
  public abstract getItem<T = string>(key: string): T | null;

  /**
   * Stores an item in browser storage.
   * @param key Storage key
   * @param value Value to store (automatically serialized if object)
   */
  public abstract setItem<T>(key: string, value: T): void;

  /**
   * Removes an item from browser storage.
   * @param key Storage key
   */
  public abstract removeItem(key: string): void;

  /**
   * Clears all items from browser storage.
   */
  public abstract clear(): void;
}
