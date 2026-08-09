import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'demo2_access_token';
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.checkSession();
  }

  checkSession(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.currentUser.set({
        id: '1',
        name: 'Demo Admin',
        email: 'admin@demo2.local',
        role: 'Administrator',
      });
      return true;
    }
    return false;
  }

  setToken(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.currentUser.set(user);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
