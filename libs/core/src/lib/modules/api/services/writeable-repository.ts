import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReadableRepository } from './readable-repository';

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
