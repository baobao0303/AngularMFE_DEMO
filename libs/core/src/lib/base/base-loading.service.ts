import { Injectable, Signal } from '@angular/core';

@Injectable()
export abstract class BaseLoadingService {
  public abstract readonly isLoading: Signal<boolean>;
  public abstract show(): void;
  public abstract hide(): void;
}
