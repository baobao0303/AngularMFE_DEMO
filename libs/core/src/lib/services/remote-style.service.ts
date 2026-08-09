import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RemoteStyleService {
  injectStyle(scope: HTMLElement, cssContent: string, mfeName: string): void {
    if (!scope || !cssContent) return;
    this.ejectStyle(scope, mfeName);
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-mfe-scope', mfeName);
    styleEl.textContent = cssContent;
    scope.appendChild(styleEl);
  }

  ejectStyle(scope: HTMLElement, mfeName: string): void {
    if (!scope) return;
    const styleEl = scope.querySelector(`style[data-mfe-scope="${mfeName}"]`);
    if (styleEl) {
      styleEl.remove();
    }
  }
}
