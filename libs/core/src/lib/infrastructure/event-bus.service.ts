import { Injectable } from '@angular/core';
import { Subject, Observable, filter } from 'rxjs';
import { BaseEventBusService } from '../base/base-event-bus.service';
import { MfeEvent } from '../domain/mfe-event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventBusService extends BaseEventBusService {
  private readonly _eventSubject = new Subject<MfeEvent<any>>();

  public constructor() {
    super();
  }

  public override emit<T>(event: MfeEvent<T>): void {
    this._eventSubject.next(event);
  }

  public override on<T>(eventType: string): Observable<MfeEvent<T>> {
    return this._eventSubject.asObservable().pipe(
      filter(e => e.type === eventType)
    );
  }
}
