import { Injectable } from '@angular/core';

export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

/**
 * Dedicated Cookie Storage Service for Angular Micro-Frontends.
 * 100% SSR-Safe for Angular Universal.
 */
@Injectable({
  providedIn: 'root'
})
export class CookieStorageService {
  public getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  public setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;
    const { days = 7, path = '/', domain, secure = false, sameSite = 'Lax' } = options;
    let expires = '';

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    const domainStr = domain ? `; domain=${domain}` : '';
    const secureStr = secure ? '; secure' : '';
    const sameSiteStr = `; samesite=${sameSite}`;

    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}${domainStr}${secureStr}${sameSiteStr}`;
  }

  public removeCookie(name: string, path = '/', domain?: string): void {
    if (typeof document === 'undefined') return;
    this.setCookie(name, '', { days: -1, path, domain });
  }

  public clearCookies(): void {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      this.removeCookie(name);
    }
  }
}
