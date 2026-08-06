import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
/**
 * Abstract contract for Cross-MFE Event Bus messaging system.
 * Allows loosely-coupled communication between shell and remote micro-frontends.
 */
export interface MfeEvent<T = any> {
  type: string;
  payload: T;
  sourceRemote: string;
  timestamp: number;
}

@Injectable()
export abstract class BaseEventBusService {
  /**
   * Emits an event across the event bus stream.
   *
   * @template T - Type of the event payload
   * @param event - The MFE event object to broadcast
   */
  public abstract emit<T>(event: MfeEvent<T>): void;

  /**
   * Listens for events of a specific type.
   *
   * @template T - Type of the expected event payload
   * @param eventType - Unique string identifier of the event type to filter
   * @returns Observable stream emitting matching MFE events
   */
  public abstract on<T>(eventType: string): Observable<MfeEvent<T>>;

  /**
   * Complete event bus subject and release resources.
   */
  public abstract destroy(): void;
}
