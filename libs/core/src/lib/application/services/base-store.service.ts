import { Injectable, signal, computed, Signal } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';

/**
 * Base Abstract Store Class providing reactive State Management powered by Angular Signals & RxJS
 * for feature services across Micro-Frontends.
 */
@Injectable()
export abstract class BaseStore<T extends object> {
  // Angular Signal State (Zone-less ready)
  private readonly _state;

  // RxJS Stream representation for RxJS pipe / async pipe compatibility
  private readonly _state$;

  // Initial state reference for automatic state resets
  private readonly _initialState: T;

  constructor(initialState: T) {
    this._initialState = { ...initialState };
    this._state = signal<T>(initialState);
    this._state$ = new BehaviorSubject<T>(initialState);
  }

  /**
   * Returns current snapshot value of state.
   */
  public get state(): T {
    return this._state();
  }

  /**
   * Returns state as a Readonly Angular Signal.
   */
  public get stateSignal(): Signal<T> {
    return this._state.asReadonly();
  }

  /**
   * Returns state as an RxJS Observable stream.
   */
  public get state$(): Observable<T> {
    return this._state$.asObservable();
  }

  /**
   * Creates a computed signal slice derived from state.
   * @param selectFn Selector function mapping state to slice K
   */
  protected selectSignal<K>(selectFn: (state: T) => K): Signal<K> {
    return computed(() => selectFn(this._state()));
  }

  /**
   * Creates an RxJS Observable slice derived from state with distinct value filtering.
   * @param selectFn Selector function mapping state to slice K
   */
  protected selectObservable<K>(selectFn: (state: T) => K): Observable<K> {
    return this._state$.asObservable().pipe(
      map(selectFn),
      distinctUntilChanged()
    );
  }

  /**
   * Updates state immutably using a partial state object or updater function.
   * @param partialState Partial state object or function returning new state
   */
  protected setState(partialState: Partial<T> | ((currentState: T) => T)): void {
    const currentState = this._state();
    const newState =
      typeof partialState === 'function'
        ? (partialState as (currentState: T) => T)(currentState)
        : { ...currentState, ...partialState };

    this._state.set(newState);
    this._state$.next(newState);
  }

  /**
   * Alias helper method to patch partial state immutably.
   */
  protected patchState(partialState: Partial<T>): void {
    this.setState(partialState);
  }

  /**
   * Resets state back to the initial state or a specified custom initial state.
   * @param customInitialState Optional custom initial state object
   */
  protected resetState(customInitialState?: T): void {
    const resetTarget = customInitialState || this._initialState;
    this.setState({ ...resetTarget });
  }
}
