import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResetPasswordReq, ResetPasswordRes } from '../models/forgot-password.model';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordApiService {
  private readonly http = inject(HttpClient);

  public sendPasswordReset(req: ResetPasswordReq): Observable<ResetPasswordRes> {
    return this.http.post<ResetPasswordRes>('/api/auth/reset-password', { email: req.email });
  }
}
