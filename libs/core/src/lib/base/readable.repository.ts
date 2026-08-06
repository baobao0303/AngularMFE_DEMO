import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ReadableRepository {
  protected readonly httpClient = inject(HttpClient);
  protected readonly destroyRef = inject(DestroyRef);

  protected readonly defaultOptions = {
    headers: {
      'Time-Zone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  protected mergeOptions(customOptions?: Record<string, any>): Record<string, any> {
    return { ...this.defaultOptions, ...customOptions };
  }

  public findAll<T>(endPoint: string, options?: Record<string, any>): Observable<T> {
    return this.httpClient.get<T>(endPoint, this.mergeOptions(options));
  }

  public findById<T>(endPoint: string, id: string, options?: Record<string, any>): Observable<T> {
    return this.httpClient.get<T>(`${endPoint}/${id}`, this.mergeOptions(options));
  }

  public findInAll<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.httpClient.post<T>(endPoint, body, this.mergeOptions(options));
  }
}
