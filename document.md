# Tài liệu kỹ thuật hệ thống
## Company Enterprise Micro-Frontend Portal

| Thuộc tính | Giá trị |
|---|---|
| **Hệ thống** | Company Enterprise Micro-Frontend Portal |
| **Phiên bản kiến trúc** | 1.0.0 |
| **Đơn vị sở hữu** | Company Engineering |
| **Trạng thái** | Nháp / Đang phát triển |
| **Framework** | Angular 18 |
| **Monorepo** | Nx Workspace 23.x |
| **Cơ chế MFE** | Webpack Module Federation (`@module-federation/enhanced`) |
| **UI Stack** | Telenor Design System (`tds-ui`) + Tailwind CSS + SCSS |
| **Kiểm thử** | Jest + ESLint |
| **Runtime yêu cầu** | Node.js >= 18.x; trình duyệt hỗ trợ ES2022 |

---

## Mục lục

1. [Mục đích & Phạm vi](#1-mục-đích--phạm-vi)
2. [Thuật ngữ & Định nghĩa](#2-thuật-ngữ--định-nghĩa)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Đặc tả ứng dụng](#4-đặc-tả-ứng-dụng)
5. [Thư viện dùng chung](#5-thư-viện-dùng-chung)
6. [Cấu hình Module Federation](#6-cấu-hình-module-federation)
7. [Hợp đồng giao tiếp](#7-hợp-đồng-giao-tiếp)
8. [Luồng dữ liệu & Hành vi runtime](#8-luồng-dữ-liệu--hành-vi-runtime)
9. [Hạ tầng & Cổng](#9-hạ-tầng--cổng)
10. [Pipeline build](#10-pipeline-build)
11. [Quy trình phát triển](#11-quy-trình-phát-triển)
12. [Quality gates](#12-quality-gates)
13. [Bảo mật](#13-bảo-mật)
14. [Sổ tay vận hành](#14-sổ-tay-vận-hành)
15. [Phụ lục](#15-phụ-lục)

---

## 1. Mục đích & Phạm vi

### 1.1. Mục đích tài liệu
Tài liệu này là **Technical System Document (TSD)** — định nghĩa kiến trúc, ranh giới module, hợp đồng runtime, và quy trình vận hành của Company Enterprise Micro-Frontend Portal. Đây là **single source of truth** cho developer, QA, DevOps, và architect.

### 1.2. Phạm vi
- Topology kiến trúc: mô hình Host-Remote MFE trong Nx Monorepo
- Trách nhiệm từng ứng dụng và routing contract
- Cấu hình Module Federation: `exposes`, `remotes`, `shared mappings`
- Giao tiếp liên-ứng dụng qua `EventBus`
- Quy trình build, serve, test
- Port assignments, yêu cầu môi trường, lệnh vận hành

### 1.3. Ngoài phạm vi
- Tài liệu nghiệp vụ (`spec_new.md`)
- Tài liệu hướng dẫn người dùng cuối
- Topology triển khai production ngoài môi trường local

---

## 2. Thuật ngữ & Định nghĩa

| Thuật ngữ | Định nghĩa |
|---|---|
| **MFE** | Ứng dụng frontend độc lập, có thể build/deploy/run riêng, đóng góp vào host application lớn hơn. |
| **Host (App Shell)** | Ứng dụng container chịu layout, routing toàn cục, auth guard, dynamic loading các remote. |
| **Remote** | MFE expose entry modules để Host consume tại runtime. |
| **Module Federation** | Kiến trúc plugin Webpack 5 cho phép composition lúc runtime giữa các ứng dụng build độc lập. |
| **Singleton dependency** | Thư viện phải tồn tại đúng 1 instance tại runtime, ví dụ `@angular/core`, `rxjs`, nhằm tránh xung đột DI container. |
| **Shared mapping** | Cấu hình Module Federation khai báo package dùng chung giữa Host và Remotes, kèm singleton + version constraints. |
| **EventBus** | Channel Pub/Sub in-memory cho phép giao tiếp decoupled giữa các MFE không cần import trực tiếp. |
| **Nx** | Monorepo build system cung cấp task orchestration, affected computation, caching. |
| **`loadRemoteModule`** | Helper API Nx/Module Federation để Host dynamically import remote entrypoints. |
| **Exposed module** | Entrypoint mà Remote công khai để Host có thể nạp động. |
| **Remote entry** | File `remoteEntry.js` do Module Federation sinh ra, chứa manifest + exposed modules. |
| **DI container** | Angular Dependency Injection container; trùng lặp instance gây lỗi singleton. |
| **Affected** | Tập hợp project bị ảnh hưởng bởi thay đổi code, dùng để giới hạn build/test scope. |
| **Named inputs** | Bộ đầu vào được đặt tên trong Nx để tái sử dụng giữa các targets (`default`, `production`). |
| **Target** | Tác vụ có thể thực thi trong Nx: `build`, `serve`, `test`, `lint`. |
| **Executor** | Bộ thực thi Nx thực hiện 1 target cụ thể, ví dụ `@nx/angular:webpack-browser`. |
| **TDS** | Telenor Design System; bộ thành phần UI chuẩn dùng chung. |
| **Interceptor** | HTTP handler đăng ký trong pipeline `HttpClient`, dùng để transform request/response. |
| **SSR** | Server-Side Rendering; Angular Universal. |
| **Mock** | Dữ liệu/hành vi giả lập phục vụ dev/demo, không gọi backend thật. |

---

## 3. Kiến trúc hệ thống

### 3.1. Mẫu kiến trúc
Hệ thống áp dụng mẫu **Host-Remote Micro-Frontend** trong 1 **Nx Workspace duy nhất**. Mỗi MFE là ứng dụng Angular độc lập, expose entrypoints qua Webpack Module Federation. Host (`app-shell`) compose các remote tại runtime thông qua dynamic imports.

### 3.2. Sơ đồ topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Nx Workspace Root                            │
│  apps/             libs/             shared/                            │
│  ├── app-shell     ├── core          ├── federation.shared.ts           │
│  ├── mfe-auth      ├── ui                                               │
│  ├── mfe-dashboard                                                      │
│  └── mfe-reporting                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Composition chỉ xảy ra tại runtime
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Browser                                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ App Shell (Host) :4200                                           │    │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐       │    │
│  │ │ Sidebar  │  │ Header   │  │ AuthGuard│  │ RouterOutlet │       │    │
│  │ └──────────┘  └──────────┘  └──────────┘  └──────┬───────┘       │    │
│  │                                         loadRemoteModule         │    │
│  └────────────────────────────────┬─────────────────────────────────┘    │
│                                   │                                      │
│             ┌─────────────────────┼─────────────────────┐                │
│             ▼                     ▼                     ▼                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ mfe-auth         │  │ mfe-dashboard    │  │ mfe-reporting    │        │
│  │    :4201         │  │    :4202         │  │    :4203         │        │
│  │ Login            │  │ Dashboard        │  │ Reporting        │        │
│  │ Forgot Pwd       │  │ Projects         │  │ Export PDF       │        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │
│           │                     │                     │                  │
│           └─────────────────────┼─────────────────────┘                │
│                                 │                                        │
│                           Shared Runtime Layer                           │
│  @angular/* (singleton)   rxjs (singleton)   tds-ui (singleton)          │
│  @core (singleton)        @ui (singleton)     EventBus (singleton)       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.3. Nguyên tắc thiết kế
1. **Independent deployability**: mỗi MFE có thể build, test, deploy độc lập.
2. **Lazy loading**: remotes chỉ fetch khi user điều hướng đến route cần dùng.
3. **Singleton enforcement**: framework và shared libraries chỉ load 1 lần qua `shared` mappings.
4. **Decoupled communication**: tương tác MFE-to-MFE qua `EventBus`; không import xuyên biên giới ứng dụng.
5. **Single source of truth**: contracts, routes, shared mappings tập trung khai báo ở `shared/` và `libs/`.

---

## 4. Đặc tả ứng dụng

### 4.1. App Shell (`apps/app-shell`)

**Trách nhiệm**: Host container cung cấp layout, routing toàn cục, authentication enforcement, error pages.

| Thành phần / Service | Vị trí | Trách nhiệm |
|---|---|---|
| `app.routes.ts` | `apps/app-shell/src/app/` | Root router config với `loadRemoteModule` entries và `authGuard` attachment. |
| `authGuard` | `apps/app-shell/src/app/` | Kiểm tra `localStorage` có `mfe_jwt_token`; redirect unauthenticated về `/auth/login`. |
| `ForbiddenComponent` (`page-403`) | `apps/app-shell/src/app/` | Render 403 khi truy cập route protected thiếu quyền. |
| `NotFoundComponent` (`page-404`) | `apps/app-shell/src/app/` | Render 404 với mascot TDS khi route không khớp. |
| Layout | `apps/app-shell/src/app/` | Sidebar navigation, Header, primary content outlet. |

**Port**: `4200`  
**Chiến lược routing**: Host sở hữu toàn bộ top-level routes; remotes mount như lazy-loaded route segments.

### 4.2. MFE Auth (`apps/mfe-auth`)

**Trách nhiệm**: Authentication flows; token issuance, storage, session lifecycle.

| Route | Component | Mô tả |
|---|---|---|
| `/auth/login` | `LoginComponent` | Form login TDS; hỗ trợ chọn role (Administrator / User); persist `mfe_jwt_token` và `mfe_mock_user` vào `localStorage`. Emit `USER_LOGGED_IN` khi success. |
| `/auth/forgot-password` | `ForgotPasswordComponent` | Password recovery flow (mock). |

**Port**: `4201`  
**Auth model**: Mock authentication; không phụ thuộc backend. Token là JWT-like string stored client-side.

### 4.3. MFE Dashboard (`apps/mfe-dashboard`)

**Trách nhiệm**: KPI dashboard và Kanban project management.

| Route | Component | Mô tả |
|---|---|---|
| `/dashboard` | `DashboardComponent` | KPI cards, project statistics, progress overview. |
| `/projects` | `ProjectsComponent` | Kanban board với 4 cột trạng thái. |

**Kanban Board Specification**:
- **Columns**: `To Do`, `In Progress`, `In Review`, `Completed`
- **Project Card**: priority badge (`HIGH` / `MEDIUM` / `LOW`), progress bar (%), subtask count, comment count, member avatars
- **Filtering**: tabs — `All`, `Active`, `Completed`, `On Hold`
- **Search**: case-insensitive match on project name
- **Sort**: by name, priority, or progress
- **Create**: modal form cho new project entry
- **Notification**: emit toast qua `TDSNotificationService` sau mỗi mutation

**Port**: `4202`

### 4.4. MFE Reporting (`apps/mfe-reporting`)

**Trách nhiệm**: Analytics, performance statistics, and data export.

| Route | Component | Mô tả |
|---|---|---|
| `/reporting` | `ReportingComponent` | Project performance statistics, charts, export controls. |

**Export capabilities**:
- Excel export (`.xlsx`)
- PDF export (`.pdf`)

**Port**: `4203`

---

## 5. Thư viện dùng chung

### 5.1. `libs/core`
Cross-cutting business logic, không phụ thuộc UI (không import TDS UI trực tiếp).

| Module | Vị trí | Trách nhiệm |
|---|---|---|
| `MockApiInterceptor` | `libs/core/src/lib/` | Intercept `HttpClient` requests; trả mock responses cho Auth, Projects, Reporting endpoints. Loại bỏ backend dependency trong dev/demo. |
| `AuthorizationTokenInterceptor` | `libs/core/src/lib/` | Đọc `mfe_jwt_token` từ `localStorage`; gắn header `Authorization: Bearer <token>` vào mọi outgoing HTTP request. |
| `StorageService` | `libs/core/src/lib/` | Type-safe wrapper cho `localStorage` / `sessionStorage` với SSR-safe guards. |
| `EventBusService` | `libs/core/src/lib/` | In-memory Pub/Sub channel. Methods: `emit(event, payload)`, `subscribe(event, handler)`, `unsubscribe(event, handler)`. |

### 5.2. `libs/ui`
Shared UI tokens, global styles, TDS overrides.

| Module | Vị trí | Trách nhiệm |
|---|---|---|
| `global.scss` | `libs/ui/src/lib/styles/` | Global CSS overrides cho Telenor Design System. Import trong mỗi app's `styles.scss`. |
| Toast Notification | `libs/ui/src/lib/styles/` | Width `340px`; left border color và icon thay đổi theo status. |
| Close Button | `libs/ui/src/lib/styles/` | 24×24px, positioned `top: 10px; right: 10px`; hover background transition; font-icon fallback. |

---

## 6. Cấu hình Module Federation

### 6.1. Shared Mappings
Định nghĩa trong `shared/federation.shared.ts` và được tất cả MFE `webpack.config.ts` consume.

```typescript
export const federationShared = {
  '@angular/core': { singleton: true, strictVersion: false },
  '@angular/common': { singleton: true, strictVersion: false },
  '@angular/router': { singleton: true, strictVersion: false },
  '@angular/platform-browser': { singleton: true, strictVersion: false },
  '@angular/platform-browser-dynamic': { singleton: true, strictVersion: false },
  'rxjs': { singleton: true, strictVersion: false },
  'tds-ui': { singleton: true, strictVersion: false },
  '@core': { singleton: true, strictVersion: false },
  '@ui': { singleton: true, strictVersion: false }
};
```

**`singleton: true`**: yêu cầu Webpack chỉ giữ 1 instance của package trên toàn bộ shared scope.  
→ Khi Remote cần dùng `@angular/core`, nó sẽ dùng chung instance mà Host đã tải, thay vì tự bundle 1 bản riêng.  
→ Tránh lỗi: nhiều `Injector`, nhiều `ChangeDetectorRef`, `EventBus` hoạt động rời rạc.

**`strictVersion: false`**: không bắt buộc Host và Remote phải cùng version tuyệt đối.  
→ Cho phép minor version drift trong dev, ví dụ Host dùng `@angular/core@18.2.0`, Remote dùng `@angular/core@18.2.1` vẫn được coi là compatible.  
→ Trong production, versions nên được align qua workspace `package.json` để đảm bảo deterministic build.

> Lưu ý: `strictVersion: false` chỉ nên dùng trong dev. Trong CI/production, khuyến nghị đặt `strictVersion: true` để phát hiện drift sớm.

**Cơ sở thiết kế**: toàn bộ các package trong bảng trên đều là thư viện framework/core, không phải business feature. Việc đảm bảo chúng singleton là bắt buộc để hệ thống MFE chạy ổn định.

### 6.2. Remote Entrypoints

| Remote Name | Exposed Module | Đường dẫn nguồn |
|---|---|---|
| `mfe-auth` | `./Login` | `apps/mfe-auth/src/app/pages/login/` |
| `mfe-auth` | `./ForgotPassword` | `apps/mfe-auth/src/app/pages/forgot-password/` |
| `mfe-dashboard` | `./Dashboard` | `apps/mfe-dashboard/src/app/pages/dashboard/` |
| `mfe-dashboard` | `./Projects` | `apps/mfe-dashboard/src/app/pages/projects/` |
| `mfe-reporting` | `./Reporting` | `apps/mfe-reporting/src/app/pages/reporting/` |

### 6.3. Mẫu Webpack Configuration
Mỗi MFE `webpack.config.ts` follow structure:

```typescript
import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { federationShared } from '../../shared/federation.shared';

export default {
  output: {
    uniqueName: '<mfe-name>',
    publicPath: 'auto'
  },
  plugins: [
    new ModuleFederationPlugin({
      name: '<mfe-name>',
      filename: 'remoteEntry.js',
      exposes: {
        './<Entry>': '<path-to-entry-module>'
      },
      shared: federationShared
    })
  ]
};
```

Host `webpack.config.ts` khai báo `remotes` trỏ đến `remoteEntry.js` của từng MFE.

### 6.4. Singleton Failure Modes
Nếu thiếu `singleton: true` cho shared package:
- Angular DI tạo nhiều `Injector` instances → Services `providedIn: 'root'` trở thành separate instances.
- RxJS Subjects emit trong isolated scopes → cross-MFE events qua `EventBus` fail.
- `ChangeDetectorRef` identity checks break → UI update anomalies.

---

## 7. Hợp đồng giao tiếp

### 7.1. Routing Contract
Host sở hữu canonical route map. Remote components không được define top-level routes độc lập.

| Host Route | Remote Source | Method |
|---|---|---|
| `/auth/login` | `mfe-auth` / `./Login` | `loadRemoteModule({ type: 'module', remoteName: 'mfe-auth', exposedModule: './Login' })` |
| `/auth/forgot-password` | `mfe-auth` / `./ForgotPassword` | `loadRemoteModule(...)` |
| `/dashboard` | `mfe-dashboard` / `./Dashboard` | `loadRemoteModule(...)` |
| `/projects` | `mfe-dashboard` / `./Projects` | `loadRemoteModule(...)` |
| `/reporting` | `mfe-reporting` / `./Reporting` | `loadRemoteModule(...)` |

### 7.2. EventBus Contract
Tất cả events là plain objects với discriminated `type` field.

| Event Name | Emitted By | Payload Shape | Subscribers |
|---|---|---|---|
| `USER_LOGGED_IN` | `mfe-auth` | `{ username: string; role: string; token: string }` | `app-shell` (header update), `mfe-dashboard`, `mfe-reporting` |
| `USER_LOGGED_OUT` | `app-shell` | `{}` | `mfe-dashboard`, `mfe-reporting` (clear session data) |
| `PROJECT_CREATED` | `mfe-dashboard` | `{ project: Project }` | `mfe-reporting` (refresh stats) |
| `PROJECT_UPDATED` | `mfe-dashboard` | `{ project: Project }` | `mfe-reporting` (refresh stats) |
| `PROJECT_DELETED` | `mfe-dashboard` | `{ projectId: string }` | `mfe-reporting` (refresh stats) |

**Constraints**:
- Events phải serializable (không class instances, functions, circular refs).
- Subscribers phải unsubscribe trong `ngOnDestroy` để tránh memory leaks.
- Event names phải unique across workspace (khuyến nghị prefix với MFE origin: `AUTH:USER_LOGGED_IN`).

### 7.3. Storage Contract
| Key | Read/Write | Owner | Description |
|---|---|---|---|
| `mfe_jwt_token` | RW | `mfe-auth` | JWT-like token string; được `AuthorizationTokenInterceptor` đọc. |
| `mfe_mock_user` | RW | `mfe-auth` | JSON object: `{ username, role, email }`. |

---

## 8. Luồng dữ liệu & Hành vi runtime

### 8.1. Luồng khởi động hệ thống

```
Người dùng mở trình duyệt
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  Browser nhận HTML từ App Shell                         │
│  http://localhost:4200                                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Angular bootstrap trong App Shell                       │
│  - Tải @angular/core, rxjs, tds-ui từ Host bundle        │
│    (singleton scope)                                     │
│  - Khởi tạo DI container                                 │
│  - Tải Layout: Sidebar + Header + RouterOutlet           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Host router resolve route ban đầu                       │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐                    │
│  │ Public route │    │ Protected    │                    │
│  │ /auth/login  │    │ /dashboard   │                    │
│  └──────┬──────┘    └──────┬───────┘                    │
│         │                  │                             │
│         ▼                  ▼                             │
│  loadRemoteModule()   authGuard kiểm tra localStorage    │
│  - mfe-auth:4201      - Có token → loadRemoteModule()   │
│  - ./Login            - Không token → redirect /auth/login│
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch remoteEntry.js + shared chunks            │
│  từ dev server của MFE tương ứng                         │
│  (ví dụ: http://localhost:4202/remoteEntry.js)           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Remote module bootstrap                                 │
│  - Tiêu thụ @angular/core từ Host (singleton)            │
│  - Injector hierarchy vẫn là 1 cấp                       │
│  - Component render vào RouterOutlet của Host            │
└─────────────────────────────────────────────────────────┘
```

### 8.2. Luồng đăng nhập

```
Người dùng truy cập /auth/login
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  App Shell (Host)                                        │
│  authGuard: /auth/login là public route                  │
│  → Cho phép truy cập                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  loadRemoteModule({                                     │
│    remoteName: 'mfe-auth',                              │
│    exposedModule: './Login'                             │
│  })                                                     │
│                                                         │
│  Browser fetch:                                         │
│  - http://localhost:4201/remoteEntry.js                 │
│  - shared chunks từ mfe-auth                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  MFE Auth bootstrap trong RouterOutlet                   │
│  LoginComponent hiển thị                                │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng nhập credentials & bấm Đăng nhập
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LoginComponent                                          │
│  → AuthService.login(username, password, role)           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  HttpClient gửi request                                 │
│  → MockApiInterceptor intercept                          │
│  → Trả về mock JWT + user data                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  StorageService lưu vào localStorage                    │
│  - mfe_jwt_token = <JWT string>                         │
│  - mfe_mock_user = { username, role, email }            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  EventBus.emit('USER_LOGGED_IN', {                      │
│    username, role, token                                │
│  })                                                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ App Shell    │  │ mfe-dashboard│  │mfe-reporting  │ │
│  │ Header update│  │ Refresh data │  │ Refresh data  │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Router.navigate(['/dashboard'])                        │
│  → Host chuyển route sang /dashboard                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  authGuard kiểm tra localStorage                         │
│  - Có mfe_jwt_token → CHO PHÉP                         │
│  → loadRemoteModule('mfe-dashboard', './Dashboard')     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  MFE Dashboard render KPI cards                         │
└─────────────────────────────────────────────────────────┘
```

### 8.3. Luồng tương tác Kanban

```
Người dùng bấm vào menu "Projects" trong Sidebar
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  Host router resolves /projects                          │
│  → authGuard: có token → CHO PHÉP                      │
│  → loadRemoteModule('mfe-dashboard', './Projects')     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch mfe-dashboard remoteEntry.js             │
│  ProjectsComponent bootstrap                             │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng tạo dự án mới qua Modal
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent                                       │
│  → ProjectsService.create(projectData)                   │
│  → HttpClient POST                                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  MockApiInterceptor                                      │
│  → Lưu project vào mock DB                               │
│  → Trả về project object đã tạo                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent cập nhật local state                  │
│  → Signals notify re-render                              │
│  → TDSNotificationService.success('Đã tạo thành công')   │
│  → Toast hiển thị ở góc trên bên phải                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  EventBus.emit('PROJECT_CREATED', { project })           │
│                                                         │
│  ┌──────────────┐                                       │
│  │mfe-reporting │                                       │
│  │ (nếu đang    │                                       │
│  │  mở /report)│ ← subscribe PROJECT_CREATED            │
│  │ Refresh stats│                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### 8.4. Luồng singleton resolution

```
┌──────────────────────────────────────────────────────────┐
│  Host Bundle (app-shell)                                 │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ @angular/core@18.2.0  ← singleton instance #1  │     │
│  │ rxjs@7.8.0            ← singleton instance #2  │     │
│  │ tds-ui@18.6.2         ← singleton instance #3  │     │
│  │ @core                 ← singleton instance #4  │     │
│  │ @ui                   ← singleton instance #5  │     │
│  └────────────────────────────────────────────────┘     │
│                          │                               │
│                          │ shared scope                  │
│                          ▼                               │
│  ┌────────────────────────────────────────────────┐     │
│  │ Remote Bundle (mfe-dashboard)                   │     │
│  │                                                │     │
│  │  Requests:                                     │     │
│  │  - @angular/core → Host cung cấp instance #1  │     │
│  │  - rxjs          → Host cung cấp instance #2  │     │
│  │  - tds-ui        → Host cung cấp instance #3  │     │
│  │                                                │     │
│  │  Result: Chỉ có 1 @angular/core, 1 rxjs, ...  │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ✅ Angular DI container vẫn là 1 cấp duy nhất          │
│  ✅ Services providedIn: 'root' là truly singleton       │
└──────────────────────────────────────────────────────────┘

KHI THIẾU singleton: true:

┌─────────────────────┐      ┌─────────────────────┐
│  Host Bundle        │      │  Remote Bundle      │
│  @angular/core #1   │      │  @angular/core #2   │ ← TÁCH BIỆT
│  Injector A         │      │  Injector B         │
└─────────────────────┘      └─────────────────────┘
         │                           │
         │    ❌ Xung đột DI container
         │    ❌ AuthGuard không nhận diện token
         │    ❌ EventBus không hoạt động
         ▼                           ▼
   Hệ thống lỗi hoặc hành vi không nhất quán
```

### 8.5. Luồng HTTP request xuyên biên giới MFE

```
┌──────────────────────────────────────────────────────────┐
│  MFE Dashboard / ProjectsComponent                        │
│                                                          │
│  ProjectsService.getProjects()                           │
│  → HttpClient.get('/api/projects')                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  AuthorizationTokenInterceptor                           │
│  - Đọc localStorage: mfe_jwt_token                       │
│  - Gắn header: Authorization: Bearer <token>             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  MockApiInterceptor                                      │
│  - Match URL /api/projects                               │
│  - Trả về mock data từ bộ nhớ                          │
│  - Không gọi backend thật                                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Response trả về ProjectsComponent                        │
│  → update() trên Signals                                  │
│  → Template tự động re-render                             │
└────────────────────────┬─────────────────────────────────┘
```

### 8.6. Luồng cross-MFE communication qua EventBus

```
┌──────────────────────────────────────────────────────────┐
│                    EventBusService (singleton)            │
│                   In-memory Pub/Sub Channel               │
└──────────────────────────────────────────────────────────┘
                         ▲
                         │ subscribe / emit
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ mfe-auth     │ │ app-shell    │ │mfe-dashboard  │
│              │ │              │ │              │
│ emit(        │ │ subscribe(   │ │ emit(        │
│   USER_      │ │   USER_      │ │   PROJECT_   │
│   LOGGED_IN) │ │   LOGGED_IN) │ │   CREATED)   │
│              │ │ → Header      │ │              │
│              │ │   update UI  │ │ subscribe(   │
│              │ │              │ │   PROJECT_   │
│              │ │              │ │   CREATED)   │
│              │ │              │ │ → Refresh     │
└──────────────┘ └──────────────┘ └──────────────┘
                         ▲
                         │ subscribe
                         ▼
                  ┌──────────────┐
                  │mfe-reporting │
                  │              │
                  │ subscribe(   │
                  │   USER_      │
                  │   LOGGED_IN) │
                  │ → Load user  │
                  │   stats      │
                  │              │
                  │ subscribe(   │
                  │   PROJECT_   │
                  │   CREATED)   │
                  │ → Refresh    │
                  │   report     │
                  └──────────────┘

QUY TẮC:
- Không import service từ MFE khác
- Emit tên sự kiện rõ ràng, có payload type
- Subscribe ở ngOnInit, unsubscribe ở ngOnDestroy
- Events phải plain object, không chứa class instance
```

### 8.7. Luồng build & deploy production

```
┌──────────────────────────────────────────────────────────┐
│  Developer chạy lệnh: npm run build                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Nx affected computation                                  │
│  - Phát hiện project nào bị thay đổi                     │
│  - Xác định dependency graph từ nx.json                  │
│  - Lọc chỉ build những project bị ảnh hưởng               │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Build thứ tự (theo dependency graph):                   │
│                                                          │
│  1. libs/core:build  → dist/libs/core/                   │
│  2. libs/ui:build    → dist/libs/ui/                     │
│  3. mfe-auth:build   → dist/apps/mfe-auth/               │
│     ├── remoteEntry.js                                   │
│     └── static chunks                                    │
│  4. mfe-dashboard:build → dist/apps/mfe-dashboard/       │
│  5. mfe-reporting:build → dist/apps/mfe-reporting/       │
│  6. app-shell:build → dist/apps/app-shell/               │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Deploy lên CDN/Static Hosting                            │
│                                                          │
│  - Upload dist/ cho từng app                              │
│  - Đảm bảo remoteEntry.js served với                    │
│    MIME type: application/javascript                     │
│  - Cấu hình CDN preserve chunk filenames                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  User truy cập production URL                             │
│  → App Shell tải từ CDN                                  │
│  → loadRemoteModule tải remotes từ CDN                   │
│  → Singleton packages được resolve từ Host               │
└────────────────────────┬─────────────────────────────────┘
```

---

## 9. Hạ tầng & Cổng

### 9.1. Development Port Map

| Ứng dụng | Cổng | Giao thức | Mục đích |
|---|---|---|---|
| `app-shell` | 4200 | HTTP | Host dev server |
| `mfe-auth` | 4201 | HTTP | Auth MFE dev server |
| `mfe-dashboard` | 4202 | HTTP | Dashboard MFE dev server |
| `mfe-reporting` | 4203 | HTTP | Reporting MFE dev server |

### 9.2. Yêu cầu mạng
- Dev servers bind to `localhost` only by default.
- Ports 4200–4203 phải available trước khi start workspace.
- `tds-ui` package fetched từ internal registry `https://tds.tmtco.org/lib/tds-ui-18.6.2.tgz`; cần network access đến Company intranet trong `npm install`.

---

## 10. Pipeline build

### 10.1. Build Targets

| Target | Executor | Đầu vào | Đầu ra |
|---|---|---|---|
| `app-shell:build` | `@nx/angular:webpack-browser` | `production` + `^production` | `dist/apps/app-shell/` |
| `mfe-auth:build` | `@nx/angular:webpack-browser` | `production` + `^production` | `dist/apps/mfe-auth/` |
| `mfe-dashboard:build` | `@nx/angular:webpack-browser` | `production` + `^production` | `dist/apps/mfe-dashboard/` |
| `mfe-reporting:build` | `@nx/angular:webpack-browser` | `production` + `^production` | `dist/apps/mfe-reporting/` |
| `core:build` | `@nx/angular:ng-packagr` | `production` | `dist/libs/core/` |
| `ui:build` | `@nx/angular:ng-packagr` | `production` | `dist/libs/ui/` |

### 10.2. Điều phối build
```bash
# Build tất cả affected projects (changed + dependents)
npm run build

# Build shared libraries only
npm run build:lib
```

Nx `affected` computation dùng `nx.json` `targetDefaults` để xác định dependency graph. Build `app-shell` trigger `^build` trên `core` và `ui` trước.

### 10.3. Production Bundle Considerations
- Tất cả remotes phải được build và deploy trước Host referencing chúng, nếu không `loadRemoteModule` fail tại runtime với `Loading remote module failed`.
- `remoteEntry.js` phải served với đúng MIME type (`application/javascript`).
- CDN hoặc static hosting phải preserve chunk filenames generated bởi Webpack.

---

## 11. Quy trình phát triển

### 11.1. Environment Setup
```bash
cd /home/baoltb/Desktop/demo
npm install
```

### 11.2. Serve Commands
```bash
npm start                        # Parallel: tất cả 4 dev servers
npm run start:shell              # app-shell only (port 4200)
npm run start:auth               # mfe-auth only (port 4201)
npm run start:dashboard          # mfe-dashboard only (port 4202)
npm run start:reporting          # mfe-reporting only (port 4203)
```

### 11.3. Testing & Lint
```bash
npm run test                     # Jest across all projects
npx nx run-many -t lint          # ESLint across all projects
```

---

## 12. Quality gates

| Gate | Tool | Enforcement |
|---|---|---|
| Code style | ESLint (flat config) | CI / pre-commit |
| Unit tests | Jest | CI |
| Build | Nx affected | CI |
| Type checking | TypeScript (`tsconfig.base.json`) | IDE + CI |
| Module Federation boundaries | Manual review + TSD §6 | PR review |

---

## 13. Bảo mật

- **Authentication**: Mock JWT stored trong `localStorage`. Không có HttpOnly cookie, không có refresh token rotation. Không suitable cho production nếu không integrate backend.
- **Authorization**: Client-side guard only. Tất cả protected routes phải re-validate server-side trong production.
- **CORS**: Trong dev, remotes và Host share origin. Trong production, remotes phải serve với CORS headers hoặc đứng sau reverse proxy.
- **Dependency trust**: `tds-ui` được install từ internal Company registry; verify checksum trong CI.
- **Secrets**: Không commit API keys hoặc credentials. `localStorage` keys (`mfe_jwt_token`, `mfe_mock_user`) không phải secrets nhưng phải được treat như session identifiers.

---

## 14. Sổ tay vận hành

### 14.1. Starting the System
```bash
cd /home/baoltb/Desktop/demo
npm start
# Verify all 4 servers are running:
#   http://localhost:4200
#   http://localhost:4201
#   http://localhost:4202
#   http://localhost:4203
```

### 14.2. Stopping the System
```bash
# Foreground processes: Ctrl+C in mỗi terminal
# Background Nx processes: kill by PID hoặc đóng terminal
```

### 14.3. Common Issues

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `Failed to fetch dynamically imported module` | Remote dev server không chạy hoặc port mismatch | Start MFE cụ thể: `npm run start:dashboard` |
| `Angular is running in development mode` warnings | Multiple Angular instances | Verify `singleton: true` trong `federation.shared.ts` cho tất cả `@angular/*` packages |
| `tds-ui` package not found | Intranet unreachable hoặc package missing | Check VPN/network; verify `https://tds.tmtco.org/lib/tds-ui-18.6.2.tgz` accessible |
| Port 420x already in use | Process khác đang chiếm port | `lsof -ti:420x | xargs kill -9` hoặc đổi port trong `angular.json` |

---

## 15. Phụ lục

### 15.1. Workspace File Map
| File | Role |
|---|---|
| `angular.json` | Project definitions, build targets, port configs, custom webpack paths |
| `nx.json` | Target defaults, named inputs (`default`, `production`), caching rules |
| `package.json` | Root dependencies, scripts, internal registry URL cho `tds-ui` |
| `tsconfig.base.json` | Base TypeScript compiler options, path mappings cho `@core` và `@ui` |
| `tailwind.config.js` | Tailwind tokens và content paths |
| `eslint.config.mjs` | ESLint flat config cho workspace |
| `jest.config.ts` / `jest.preset.js` | Jest configuration và preset |

### 15.2. Script Reference
| Script | Equivalent Command | Description |
|---|---|---|
| `npm start` | `nx run-many -t serve --parallel=4` | Start tất cả dev servers |
| `npm run start:shell` | `nx serve app-shell` | Start Host only |
| `npm run start:auth` | `nx serve mfe-auth` | Start Auth MFE |
| `npm run start:dashboard` | `nx serve mfe-dashboard` | Start Dashboard MFE |
| `npm run start:reporting` | `nx serve mfe-reporting` | Start Reporting MFE |
| `npm run build` | `nx affected -t build --parallel=4` | Build affected apps |
| `npm run build:lib` | `nx build core && nx build ui` | Build shared libraries |
| `npm run test` | `nx run-many -t test` | Run Jest |

### 15.3. Dependency Matrix (Key Packages)
| Package | Version | Consumers |
|---|---|---|
| `@angular/core` | ~18.2.0 | Host + tất cả Remotes |
| `rxjs` | ~7.8.0 | Host + tất cả Remotes |
| `tds-ui` | 18.6.2 | Host + tất cả Remotes |
| `@module-federation/enhanced` | ^2.8.0 | Tất cả MFE webpack configs |
| `@nx/angular` | 23.1.0 | Build/serve/lint executors |
| `tailwindcss` | ^3.4.17 | Global styling utilities |

---

## Lịch sử sửa đổi

| Phiên bản | Ngày | Tác giả | Ghi chú |
|---|---|---|---|
| 1.0.0 | 2026-08-07 | Company Engineering | Technical system document ban đầu |
