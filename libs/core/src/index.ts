// Core Providers
export * from './lib/shared/providers/core.provider';

// 1. Identity Module (Authentication & Security)
export * from './lib/modules/identity/models/auth.model';
export * from './lib/modules/identity/services/base-auth.service';
export * from './lib/modules/identity/services/auth.service';
export * from './lib/modules/identity/guards/auth.guard';

// 2. API Module (API Client, Repositories & Interceptors)
export * from './lib/modules/api/models/api-response.model';
export * from './lib/modules/api/di-tokens/api-url.token';
export * from './lib/modules/api/services/base-api.service';
export * from './lib/modules/api/services/readable-repository';
export * from './lib/modules/api/services/writeable-repository';
export * from './lib/modules/api/interceptors/base-token.interceptor';
export * from './lib/modules/api/interceptors/authorization-token.interceptor';

// 3. Micro-Frontend Module (MFE Orchestration & EventBus)
export * from './lib/mfe/mfe-config';
export * from './lib/mfe/event-bus.service';
export * from './lib/mfe/event-bus.model';
export * from './lib/mfe/remote-style.service';
export * from './lib/mfe/remote-style.model';
export * from './lib/mfe/style-registry.util';
export * from './lib/mfe/preload-strategy.service';
export * from './lib/mfe/loading.service';

// 4. Shared Infrastructure Module (Storage, State, Utils, Directives)
export * from './lib/shared/storage';
export * from './lib/shared/store';
export * from './lib/shared/utils/json.util';
export * from './lib/shared/utils/query-string.util';
export * from './lib/shared/utils/remote-loader.util';
export * from './lib/shared/utils/uuid.util';
export * from './lib/shared/directives/base-view.directive';
