import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  public login(email: string, pass: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password: pass });
  }

  public ssoLogin(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/sso-login', {});
  }

  public sendPasswordReset(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>('/api/auth/reset-password', { email });
  }
}
