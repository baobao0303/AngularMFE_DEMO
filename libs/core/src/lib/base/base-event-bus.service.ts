import { Injectable } from '@angular/core';
import { Subject, Observable, filter } from 'rxjs';

/**
 * Contract and Root Service for Cross-MFE Event Bus messaging system.
 */
export interface MfeEvent<T = any> {
  type: string;
  payload: T;
  sourceRemote: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class BaseEventBusService {
  private readonly _eventSubject = new Subject<MfeEvent<any>>();

  public emit<T>(event: MfeEvent<T>): void {
    this._eventSubject.next(event);
  }

  public on<T>(eventType: string): Observable<MfeEvent<T>> {
    return this._eventSubject.asObservable().pipe(
      filter(e => e.type === eventType)
    );
  }

  public destroy(): void {
    this._eventSubject.complete();
  }
}
