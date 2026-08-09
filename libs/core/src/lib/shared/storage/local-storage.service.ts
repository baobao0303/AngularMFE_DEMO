import { Injectable } from '@angular/core';

/**
 * Dedicated LocalStorage Service for Angular Micro-Frontends.
 * 100% SSR-Safe for Angular Universal.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public getItem<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  public setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }

  public removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  public clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}
