import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginReq } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  public login(req: LoginReq): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email: req.email, password: req.pass });
  }

  public ssoLogin(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/sso-login', {});
  }
}
