import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { generateUUID, objectToQueryString } from '../../common/utils';

export interface CRUDResult<T = unknown> {
  status: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  public get<T>(url: string, params?: HttpParams | Record<string, unknown>): Observable<T> {
    const httpParams = params instanceof HttpParams ? params : new HttpParams({ fromObject: params as Record<string, string> });
    return this.sendRequest<T>('GET', url, null, httpParams);
  }

  public getById<T>(url: string, id: number | string): Observable<T> {
    return this.sendRequest<T>('GET', `${url}/${id}`);
  }

  public post<T>(url: string, body?: unknown): Observable<T> {
    return this.sendRequest<T>('POST', url, body);
  }

  public put<T>(url: string, body?: unknown): Observable<T> {
    return this.sendRequest<T>('PUT', url, body);
  }

  public patch<T>(url: string, body?: unknown): Observable<T> {
    return this.sendRequest<T>('PATCH', url, body);
  }

  public delete<T>(url: string, id?: number | string): Observable<T> {
    return this.sendRequest<T>('DELETE', id !== undefined ? `${url}/${id}` : url);
  }

  public postFormData<T>(url: string, value?: Record<string, unknown>): Observable<T> {
    const formData = new FormData();
    if (value) {
      Object.keys(value).forEach((key) => {
        if (value[key] !== undefined && value[key] !== null) {
          formData.append(key, String(value[key]));
        }
      });
    }
    return this.executeRequest<T>(new HttpRequest('POST', url, formData, { headers: this.setHeaders(), reportProgress: true, responseType: 'json' }));
  }

  public postFile<T>(url: string, file: File, value?: Record<string, unknown>): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (value) {
      Object.keys(value).forEach((key) => {
        if (value[key] !== undefined && value[key] !== null) formData.append(key, String(value[key]));
      });
    }
    return this.executeRequest<T>(new HttpRequest('POST', url, formData, { headers: this.setHeaders(), reportProgress: true, responseType: 'json' }));
  }

  protected sendRequest<T>(method: string, url: string, data: unknown = null, params?: HttpParams): Observable<T> {
    return this.executeRequest<T>(new HttpRequest<unknown>(method, url, data, { headers: this.setHeaders(), params, withCredentials: true, responseType: 'json' }));
  }

  protected executeRequest<T>(req: HttpRequest<unknown>): Observable<T> {
    return this.http.request<CRUDResult<T>>(req).pipe(
      filter((event: HttpEvent<CRUDResult<T>>): event is HttpResponse<CRUDResult<T>> => event.type === HttpEventType.Response),
      map((response: HttpResponse<CRUDResult<T>>) => response.body as CRUDResult<T>),
      tap((apiResponse: CRUDResult<T>) => {
        if (apiResponse && apiResponse.status !== 200 && apiResponse.status !== undefined) {
          throw { status: apiResponse.status, message: apiResponse.message };
        }
      }),
      map((apiResponse: CRUDResult<T>) => (apiResponse && apiResponse.data !== undefined ? apiResponse.data : (apiResponse as unknown as T))),
      catchError((error: { status?: number; message?: string }) => {
        if (error && error.status === 400) {
          return throwError(() => ({ status: error.status, message: 'Dữ liệu không hợp lệ. Vui lòng thao tác lại' }));
        }
        return throwError(() => error);
      })
    );
  }

  protected setHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('X-Context-ID', generateUUID());
    if (typeof window !== 'undefined') {
      headers = headers.set('returnUrl', window.location.href);
    }
    return headers;
  }

  public objectToQueryString(obj: Record<string, unknown>): string {
    return objectToQueryString(obj);
  }

  public generateUUID(): string {
    return generateUUID();
  }
}

@Injectable({ providedIn: 'root' })
export class ReadableRepository extends BaseApiService {
  protected readonly defaultOptions = {
    headers: {
      'Time-Zone': typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    },
  };

  protected mergeOptions(customOptions?: Record<string, any>): Record<string, any> {
    return { ...this.defaultOptions, ...customOptions };
  }

  public findAll<T>(endPoint: string, options?: Record<string, any>): Observable<T> {
    const params = options?.['params'];
    return this.get<T>(endPoint, params);
  }

  public findById<T>(endPoint: string, id: string, options?: Record<string, any>): Observable<T> {
    return this.getById<T>(endPoint, id);
  }

  public findInAll<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.post<T>(endPoint, body);
  }
}

@Injectable({ providedIn: 'root' })
export class WriteableRepository extends ReadableRepository {
  public create<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.post<T>(endPoint, body);
  }

  public update<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.put<T>(endPoint, body);
  }

  public remove<T>(endPoint: string, options?: Record<string, any>): Observable<T> {
    return this.delete<T>(endPoint);
  }
}
