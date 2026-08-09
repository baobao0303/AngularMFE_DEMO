# Core Library

Shared foundational layer for all Micro-Frontends.

## Structure

```
lib/
├── application/
│   ├── guards/
│   │   └── preload-strategy.service.ts
│   └── services/
│       ├── base-store.service.ts
│       └── event-bus.service.ts
├── common/
│   ├── types/
│   │   └── event-bus.model.ts
│   └── utils/
│       ├── json.util.ts
│       ├── query-string.util.ts
│       └── uuid.util.ts
├── infrastructure/
│   ├── http/
│   │   ├── base-api.service.ts
│   │   └── interceptors/
│   │       └── authorization-token.interceptor.ts
│   ├── storage/
│   │   ├── storage.service.ts
│   │   ├── local-storage.service.ts
│   │   ├── session-storage.service.ts
│   │   └── cookie-storage.service.ts
│   └── styles/
│       ├── remote-style.model.ts
│       └── remote-style.service.ts
├── base-view.directive.ts
└── providers.ts
```

## Usage

```ts
import { provideCore } from '@core';
import { BaseApiService } from '@core/infrastructure/http/base-api.service';
import { BaseStore } from '@core/application/services/base-store.service';
import { BaseView } from '@core/base-view.directive';
```
