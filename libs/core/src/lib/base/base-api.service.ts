import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Abstract contract for HTTP API client communication.
 * Encapsulates standard RESTful methods (GET, POST, PUT, PATCH, DELETE).
 */
@Injectable()
export abstract class BaseApiService {
  /**
   * Performs HTTP GET request.
   * @template T Response type
   * @param url Target endpoint URL
   * @param params Optional query parameters
   */
  public abstract get<T>(url: string, params?: HttpParams | Record<string, any>): Observable<T>;

  /**
   * Performs HTTP POST request.
   * @template T Response type
   * @param url Target endpoint URL
   * @param body Request payload
   */
  public abstract post<T>(url: string, body: any): Observable<T>;

  /**
   * Performs HTTP PUT request.
   * @template T Response type
   * @param url Target endpoint URL
   * @param body Request payload
   */
  public abstract put<T>(url: string, body: any): Observable<T>;

  /**
   * Performs HTTP PATCH request.
   * @template T Response type
   * @param url Target endpoint URL
   * @param body Request payload
   */
  public abstract patch<T>(url: string, body: any): Observable<T>;

  /**
   * Performs HTTP DELETE request.
   * @template T Response type
   * @param url Target endpoint URL
   */
  public abstract delete<T>(url: string): Observable<T>;
}
