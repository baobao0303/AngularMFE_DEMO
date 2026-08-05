import { Signal } from '@angular/core';
import { UserProfile } from '../domain/user-profile.interface';

export abstract class BaseAuthService {
  public abstract readonly currentUser: Signal<UserProfile | null>;
  public abstract readonly isAuthenticated: Signal<boolean>;

  public abstract checkSession(): Promise<boolean>;
  public abstract login(credentials: { email: string; pass: string }): Promise<UserProfile>;
  public abstract register(details: { email: string; pass: string; name: string }): Promise<UserProfile>;
  public abstract logout(): Promise<void>;
}
