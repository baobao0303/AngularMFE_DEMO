import { Observable } from 'rxjs';
import { MfeEvent } from '../domain/mfe-event.interface';

export abstract class BaseEventBusService {
  public abstract emit<T>(event: MfeEvent<T>): void;
  public abstract on<T>(eventType: string): Observable<MfeEvent<T>>;
}
