import { Injectable } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';
import { EventPayloadType, MfeEvent } from './event-bus.model';

@Injectable({ providedIn: 'root' })
export class BaseEventBusService {
  protected readonly eventSubject = new Subject<MfeEvent<unknown>>();

  public emit<T = EventPayloadType>(event: MfeEvent<T>): void;
  public emit<T = EventPayloadType>(type: string, payload: T, sourceRemote?: string): void;
  public emit<T = EventPayloadType>(typeOrEvent: string | MfeEvent<T>, payload?: T, sourceRemote = 'core'): void {
    const event: MfeEvent<T> =
      typeof typeOrEvent === 'string'
        ? { type: typeOrEvent, payload: payload as T, sourceRemote, timestamp: Date.now() }
        : typeOrEvent;

    this.eventSubject.next(event as MfeEvent<unknown>);
  }

  public on<T = EventPayloadType>(eventType: string): Observable<MfeEvent<T>> {
    return this.eventSubject.asObservable().pipe(filter((e): e is MfeEvent<T> => e.type === eventType));
  }

  public onPayload<T = EventPayloadType>(eventType: string): Observable<T> {
    return this.on<T>(eventType).pipe(map((e) => e.payload));
  }
}
