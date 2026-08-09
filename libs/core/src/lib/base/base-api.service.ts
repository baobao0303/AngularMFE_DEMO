import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Contract and Root Service for HTTP API client communication.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  public get<T>(url: string, params?: HttpParams | Record<string, any>): Observable<T> {
    return this.http.get<T>(url, { params });
  }

  public post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  public patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body);
  }

  public delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
