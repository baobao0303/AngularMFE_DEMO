import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReadableRepository } from './readable.repository';

@Injectable()
export class WriteableRepository extends ReadableRepository {
  public add<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.httpClient.post<T>(endPoint, body, this.mergeOptions(options));
  }

  public update<T>(endPoint: string, body: any, options?: Record<string, any>): Observable<T> {
    return this.httpClient.put<T>(endPoint, body, this.mergeOptions(options));
  }

  public delete<T>(endPoint: string, options?: Record<string, any>): Observable<T> {
    return this.httpClient.delete<T>(endPoint, this.mergeOptions(options));
  }
}
