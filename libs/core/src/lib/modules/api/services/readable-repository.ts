import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

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
