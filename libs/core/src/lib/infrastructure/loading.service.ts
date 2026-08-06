import { Injectable, signal, Signal } from '@angular/core';
import { BaseLoadingService } from '../base/base-loading.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService extends BaseLoadingService {
  private count = 0;
  private readonly _isLoading = signal(false);

  public override readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  public override show(): void {
    this.count++;
    if (this.count > 0) {
      this._isLoading.set(true);
    }
  }

  public override hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this._isLoading.set(false);
    }
  }
}
