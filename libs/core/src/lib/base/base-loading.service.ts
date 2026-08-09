import { Injectable, signal, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseLoadingService {
  private count = 0;
  private readonly _isLoading = signal(false);

  public readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  public show(): void {
    this.count++;
    if (this.count > 0) {
      this._isLoading.set(true);
    }
  }

  public hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this._isLoading.set(false);
    }
  }
}
