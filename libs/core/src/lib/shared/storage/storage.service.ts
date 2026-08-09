import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';
import { CookieStorageService, CookieOptions } from './cookie-storage.service';

export const STORAGE_TOKEN_KEYS = {
  ACCESS_TOKEN: 'mfe_access_token',
  REFRESH_TOKEN: 'mfe_refresh_token',
  USER_PROFILE: 'mfe_user_profile',
} as const;

export interface IStorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

@Injectable({ providedIn: 'root' })
export class BaseStorageService implements IStorageService {
  public readonly local = inject(LocalStorageService);
  public readonly session = inject(SessionStorageService);
  public readonly cookie = inject(CookieStorageService);

  public getItem<T>(key: string): T | null {
    return this.local.getItem<T>(key);
  }

  public setItem<T>(key: string, value: T): void {
    this.local.setItem<T>(key, value);
  }

  public removeItem(key: string): void {
    this.local.removeItem(key);
  }

  public clear(): void {
    this.local.clear();
  }

  public getSessionItem<T>(key: string): T | null {
    return this.session.getItem<T>(key);
  }

  public setSessionItem<T>(key: string, value: T): void {
    this.session.setItem<T>(key, value);
  }

  public removeSessionItem(key: string): void {
    this.session.removeItem(key);
  }

  public clearSession(): void {
    this.session.clear();
  }

  public getCookie(name: string): string | null {
    return this.cookie.getCookie(name);
  }

  public setCookie(name: string, value: string, options: CookieOptions = {}): void {
    this.cookie.setCookie(name, value, options);
  }

  public removeCookie(name: string, path = '/', domain?: string): void {
    this.cookie.removeCookie(name, path, domain);
  }

  public clearCookies(): void {
    this.cookie.clearCookies();
  }

  public getAccessToken(): string | null {
    const fromCookie = this.getCookie(STORAGE_TOKEN_KEYS.ACCESS_TOKEN);
    if (fromCookie) return fromCookie;
    return this.getItem<string>(STORAGE_TOKEN_KEYS.ACCESS_TOKEN);
  }

  public setAccessToken(token: string, options: CookieOptions = {}): void {
    this.setItem(STORAGE_TOKEN_KEYS.ACCESS_TOKEN, token);
    this.setCookie(STORAGE_TOKEN_KEYS.ACCESS_TOKEN, token, options);
  }

  public removeAccessToken(domain?: string): void {
    this.removeItem(STORAGE_TOKEN_KEYS.ACCESS_TOKEN);
    this.removeCookie(STORAGE_TOKEN_KEYS.ACCESS_TOKEN, '/', domain);
  }

  public getRefreshToken(): string | null {
    const fromCookie = this.getCookie(STORAGE_TOKEN_KEYS.REFRESH_TOKEN);
    if (fromCookie) return fromCookie;
    return this.getItem<string>(STORAGE_TOKEN_KEYS.REFRESH_TOKEN);
  }

  public setRefreshToken(token: string, options: CookieOptions = {}): void {
    this.setItem(STORAGE_TOKEN_KEYS.REFRESH_TOKEN, token);
    this.setCookie(STORAGE_TOKEN_KEYS.REFRESH_TOKEN, token, options);
  }

  public removeRefreshToken(domain?: string): void {
    this.removeItem(STORAGE_TOKEN_KEYS.REFRESH_TOKEN);
    this.removeCookie(STORAGE_TOKEN_KEYS.REFRESH_TOKEN, '/', domain);
  }

  public getUserProfile<T>(): T | null {
    return this.getItem<T>(STORAGE_TOKEN_KEYS.USER_PROFILE);
  }

  public setUserProfile<T>(user: T): void {
    this.setItem<T>(STORAGE_TOKEN_KEYS.USER_PROFILE, user);
  }

  public removeUserProfile(): void {
    this.removeItem(STORAGE_TOKEN_KEYS.USER_PROFILE);
  }
}
