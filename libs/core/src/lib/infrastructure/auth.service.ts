import { Injectable, signal, computed, Signal } from '@angular/core';
import { BaseAuthService } from '../base/base-auth.service';
import { UserProfile } from '../domain/user-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseAuthService {
  private readonly _userSignal = signal<UserProfile | null>(null);

  public override readonly currentUser: Signal<UserProfile | null> = this._userSignal.asReadonly();
  public override readonly isAuthenticated: Signal<boolean> = computed(() => this._userSignal() !== null);

  public constructor() {
    super();
    this.initMockSession();
  }

  private initMockSession(): void {
    const saved = localStorage.getItem('mfe_mock_user');
    if (saved) {
      try {
        this._userSignal.set(JSON.parse(saved));
      } catch {
        this._userSignal.set(null);
      }
    }
  }

  public override async checkSession(): Promise<boolean> {
    return this.isAuthenticated();
  }

  public override async login(credentials: { email: string; pass: string }): Promise<UserProfile> {
    const mockUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role: 'Administrator'
    };
    this._userSignal.set(mockUser);
    localStorage.setItem('mfe_mock_user', JSON.stringify(mockUser));
    return mockUser;
  }

  public override async register(details: { email: string; pass: string; name: string }): Promise<UserProfile> {
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: details.email,
      name: details.name,
      role: 'Member'
    };
    this._userSignal.set(newUser);
    localStorage.setItem('mfe_mock_user', JSON.stringify(newUser));
    return newUser;
  }

  public override async logout(): Promise<void> {
    this._userSignal.set(null);
    localStorage.removeItem('mfe_mock_user');
  }
}
