import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseStorageService } from '../../../shared/storage/storage.service';
import { User } from '../models/auth.model';

/**
 * Abstract Base AuthService to allow multi-project extensions and custom User models.
 */
@Injectable()
export abstract class BaseAuthService<TUser = User> {
  protected readonly storage = inject(BaseStorageService);
  protected readonly platformId = inject(PLATFORM_ID);

  public readonly currentUser = signal<TUser | null>(null);

  constructor() {
    this.checkSession();
  }

  public checkSession(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = this.getToken();
    const userProfile = this.storage.getUserProfile<TUser>();
    if (token) {
      this.currentUser.set(userProfile || this.getDefaultUser());
      return true;
    }
    return false;
  }

  public setToken(token: string, user: TUser): void {
    this.storage.setAccessToken(token);
    this.storage.setUserProfile(user);
    this.currentUser.set(user);
  }

  public logout(): void {
    this.storage.removeAccessToken();
    this.storage.removeUserProfile();
    this.currentUser.set(null);
    this.onLogout();
  }

  public getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.storage.getAccessToken();
  }

  /** Hook to provide fallback user when token exists but profile is not loaded */
  protected getDefaultUser(): TUser | null {
    return null;
  }

  /** Extension hook executed upon logout */
  protected onLogout(): void {}
}
