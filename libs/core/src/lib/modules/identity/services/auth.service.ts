import { Injectable } from '@angular/core';
import { BaseAuthService } from './base-auth.service';
import { User } from '../models/auth.model';

/**
 * Default AuthService implementation for the application.
 * Real user profile & tokens are set dynamically upon backend API responses via setToken(token, user).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseAuthService<User> {}
