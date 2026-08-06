import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends BaseApiService {
  private readonly _http = inject(HttpClient);

  public override get<T>(url: string, params?: HttpParams | Record<string, any>): Observable<T> {
    return this._http.get<T>(url, { params });
  }

  public override post<T>(url: string, body: any): Observable<T> {
    return this._http.post<T>(url, body);
  }

  public override put<T>(url: string, body: any): Observable<T> {
    return this._http.put<T>(url, body);
  }

  public override patch<T>(url: string, body: any): Observable<T> {
    return this._http.patch<T>(url, body);
  }

  public override delete<T>(url: string): Observable<T> {
    return this._http.delete<T>(url);
  }
}
