# Core Library (@microfrontend/core)

Shared foundational layer, infrastructure, and Micro-Frontend orchestration for all applications.

## Architecture & Folder Structure

```text
lib/
├── modules/                                # Core Domain Modules
│   ├── identity/                           # Identity, Authentication & Security
│   │   ├── guards/                         # auth.guard.ts
│   │   ├── models/                         # auth.model.ts (User Interface)
│   │   └── services/                       # base-auth.service.ts, auth.service.ts
│   │
│   └── api/                                # API Client, Repositories & Interceptors
│       ├── di-tokens/                      # api-url.token.ts (API_BASE_URL)
│       ├── interceptors/                   # base-token.interceptor.ts, authorization-token.interceptor.ts
│       ├── models/                         # api-response.model.ts (CRUDResult)
│       └── services/                       # base-api.service.ts, readable-repository.ts, writeable-repository.ts
│
├── mfe/                                    # Micro-Frontend Engine & Messaging
│   ├── mfe-config.ts                       # Ports, URLs & Manifests configuration
│   ├── event-bus.service.ts                # Cross-MFE Event Bus System
│   ├── event-bus.model.ts                  # Event Bus Messages & Contracts
│   ├── remote-style.service.ts             # Dynamic Style Loader & Theme Injector
│   ├── remote-style.model.ts               # Remote Style Options
│   ├── preload-strategy.service.ts         # Route Preloader Strategy
│   └── loading.service.ts                  # Global Loading Indicator Service
│
└── shared/                                 # Shared Infrastructure & Utilities
    ├── providers/                          # core.provider.ts (provideCore())
    ├── storage/                            # Storage Adapters (Local, Session, Cookie)
    ├── store/                              # Signal Store Infrastructure & Helpers
    ├── utils/                              # Pure Utility Functions (UUID, JSON, QueryString)
    └── directives/                         # Base Directives (base-view.directive.ts)
```

## Public Exports & Usage

All public APIs are exported via the top-level barrel file (`@microfrontend/core`):

```ts
import { 
  provideCore, 
  AuthService, 
  authGuard, 
  BaseApiService, 
  WriteableRepository,
  BaseStorageService, 
  BaseEventBusService 
} from '@microfrontend/core';
```

### 1. Bootstrapping Core Providers (`app.config.ts`)

```ts
import { ApplicationConfig } from '@angular/core';
import { provideCore } from '@microfrontend/core';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore({ routes: appRoutes })
  ]
};
```

### 2. Protecting Routes (`app.routes.ts`)

```ts
import { Route } from '@angular/router';
import { authGuard } from '@microfrontend/core';

export const routes: Route[] = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('mfe-dashboard/Routes')
  }
];
```

### 3. Injecting Auth State & API Repositories

```ts
import { Component, inject } from '@angular/core';
import { AuthService, WriteableRepository } from '@microfrontend/core';

@Component({
  standalone: true,
  templateUrl: './demo.component.html'
})
export class DemoComponent {
  private authService = inject(AuthService);
  private apiRepo = inject(WriteableRepository);

  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
```
