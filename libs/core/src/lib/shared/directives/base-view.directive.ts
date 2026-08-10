import { Directive, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseStorageService } from '../storage/storage.service';
import { BaseEventBusService } from '../../mfe/event-bus.service';

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

@Directive()
export abstract class BaseView {
  protected readonly storage = inject(BaseStorageService);
  protected readonly eventBus = inject(BaseEventBusService);
  protected readonly router = inject(Router);
}
