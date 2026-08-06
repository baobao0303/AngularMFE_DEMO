import { Injectable } from '@angular/core';
import { BaseStorageService } from '../base/base-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends BaseStorageService {
  public override getItem<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  public override setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }

  public override removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  public override clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}
