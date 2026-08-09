import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Preloading Strategy for selective background loading of MFE Remote modules
 * after initial shell rendering when `data: { preload: true }` is specified on the route.
 */
@Injectable({
  providedIn: 'root',
})
export class MfePreloadStrategy implements PreloadingStrategy {
  /**
   * Determines if a route should be preloaded based on route data `preload: true`.
   */
  public preload(route: Route, fn: () => Observable<unknown>): Observable<unknown> {
    if (route.data && route.data['preload'] === true) {
      return fn();
    }
    return of(null);
  }
}
