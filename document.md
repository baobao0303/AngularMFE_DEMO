# Tài liệu kỹ thuật hệ thống
## Company Enterprise Micro-Frontend Portal

| Thuộc tính | Giá trị |
|---|---|
| **Hệ thống** | Company Enterprise Micro-Frontend Portal |
| **Framework** | Angular 18 |
| **Monorepo** | Nx Workspace 23.x |
| **Cơ chế MFE** | Webpack Module Federation (`@module-federation/enhanced`) |
| **UI Stack** | Telenor Design System (`tds-ui`) + Tailwind CSS + SCSS |
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
- Tài liệu nghiệp vụ (`spec.md`)
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
          │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ mfe-auth         │  │ mfe-dashboard    │  │ mfe-reporting    │        │
│  │    :4201         │  │    :4202         │  │    :4203         │        │
│  │ Login            │  │ Dashboard        │  │ Reporting        │        │
│  │ Forgot Pwd       │  │ Projects         │  │ Export PDF       │        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │
│           │                     │                     │                  │
│           └─────────────────────┼─────────────────────┘                  │
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

**Trách nhiệm**: Host application; layout container, global navigation, authentication guard, remote module loader.

| Thành phần | Đường dẫn | Trách nhiệm |
|---|---|---|
| `AppComponent` | `apps/app-shell/src/app/app.component.ts` | Layout shell: Sidebar (`tds-side-nav`), Header (`tds-header`), `<router-outlet>`. |
| `authGuard` | `apps/app-shell/src/app/guards/auth.guard.ts` | Functional CanActivate guard; kiểm tra JWT token trong `localStorage`. Redirect đến `/auth/login` nếu chưa auth. |
| `app.routes.ts` | `apps/app-shell/src/app/app.routes.ts` | Dynamic routes mapping tới remote modules via `loadRemoteModule`. |

**Port**: `4200`  
**Chiến lược routing**: Host sở hữu toàn bộ top-level routes; remotes mount như lazy-loaded route segments.

#### 🔄 Sơ đồ luồng khởi động hệ thống (System Startup Flow)

```
Người dùng mở trình duyệt
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  Browser nhận HTML từ App Shell                         │
│  http://localhost:4200                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Angular bootstrap trong App Shell                      │
│  - Tải @angular/core, rxjs, tds-ui từ Host bundle       │
│    (singleton scope)                                    │
│  - Khởi tạo DI container                                │
│  - Tải Layout: Sidebar + Header + RouterOutlet          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Host router resolve route ban đầu                      │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐                    │
│  │ Public route │    │ Protected    │                   │
│  │ /auth/login  │    │ /dashboard   │                   │
│  └──────┬──────┘    └──────┬───────┘                    │
│         │                  │                            │
│         ▼                  ▼                            │
│  loadRemoteModule()   authGuard kiểm tra localStorage   │
│  - mfe-auth:4201    - Có token → loadRemoteModule()     │
│  - ./Login          - Không token → redirect /auth/login│
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch remoteEntry.js + shared chunks           │
│  từ dev server của MFE tương ứng                        │
│  (ví dụ: http://localhost:4202/remoteEntry.js)          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Remote module bootstrap                                │
│  - Tiêu thụ @angular/core từ Host (singleton)           │
│  - Injector hierarchy vẫn là 1 cấp                      │
│  - Component render vào RouterOutlet của Host           │
└─────────────────────────────────────────────────────────┘
```

---

### 4.2. MFE Auth (`apps/mfe-auth`)

**Trách nhiệm**: Authentication flows; token issuance, storage, session lifecycle.

| Route | Component | Mô tả |
|---|---|---|
| `/auth/login` | `LoginComponent` | Form login TDS; hỗ trợ chọn role (Administrator / User); persist `mfe_jwt_token` và `mfe_mock_user` vào `localStorage`. Emit `USER_LOGGED_IN` khi success. |
| `/auth/forgot-password` | `ForgotPasswordComponent` | Password recovery flow (mock). |

**Port**: `4201`  
**Auth model**: Mock authentication; không phụ thuộc backend. Token là JWT-like string stored client-side.

#### 🔄 Sơ đồ luồng đăng nhập (Login Flow)

```
Người dùng truy cập /auth/login
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  App Shell (Host)                                       │
│  authGuard: /auth/login là public route                 │
│  → Cho phép truy cập                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  loadRemoteModule({ remoteName: 'mfe-auth', ... })      │
│  Browser fetch: http://localhost:4201/remoteEntry.js    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  MFE Auth bootstrap trong RouterOutlet                  │
│  LoginComponent hiển thị                                │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng nhập credentials & bấm Đăng nhập
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LoginComponent → AuthService.login(...)                │
│  → MockApiInterceptor intercept & trả mock JWT + user   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  StorageService lưu mfe_jwt_token & mfe_mock_user       │
│  EventBus.emit('USER_LOGGED_IN', payload)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Router.navigate(['/dashboard'])                        │
│  → authGuard kiểm tra token OK → Load MFE Dashboard     │
└─────────────────────────────────────────────────────────┘
```

---

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

#### 🔄 Sơ đồ luồng tương tác Kanban (Kanban Board Interaction Flow)

```
Người dùng chọn "Projects" trong Sidebar
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  Host router resolves /projects                         │
│  → authGuard: token OK → loadRemoteModule('mfe-dashboard')│
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch mfe-dashboard remoteEntry.js             │
│  ProjectsComponent bootstrap                            │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng tạo dự án mới qua Modal
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent → ProjectsService.create(...)        │
│  → MockApiInterceptor lưu mock DB & trả về data         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent cập nhật Signals state               │
│  → TDSNotificationService.success('Đã tạo thành công')  │
│  → EventBus.emit('PROJECT_CREATED', { project })        │
│    (mfe-reporting tự động refresh thống kê)             │
└────────────────────────┬────────────────────────────────┘
```

---

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

Phân khu `libs/` chứa các tài nguyên được chia sẻ giữa **Host (`app-shell`)** và các **Remote MFEs (`mfe-auth`, `mfe-dashboard`, `mfe-reporting`)**.

### 5.1. `libs/core` (`@core`) — Logic & Hạ tầng nghiệp vụ

| Tài nguyên share | Loại | Lý do bắt buộc phải share |
| ---------------- | ---- | ------------------------- |
| **`EventBusService`** | Service (Singleton) | **Giao tiếp liên MFE:** Đảm bảo tất cả MFE dùng chung 1 kênh Pub/Sub duy nhất. Nếu không share, các sự kiện như `USER_LOGGED_IN` hay `USER_LOGGED_OUT` từ `mfe-auth` sẽ không truyền tới được Host hay các Remote khác. |
| **`StorageService`** | Service | **Đồng bộ phiên đăng nhập:** Thống nhất việc đọc/ghi `localStorage` (`mfe_jwt_token`, `mfe_mock_user`) giữa các MFE, đồng thời đảm bảo an toàn không gây lỗi khi chạy Server-Side Rendering (SSR). |
| **`AuthorizationTokenInterceptor`** | HTTP Interceptor | **Bảo mật nhất quán:** Tự động đính kèm header `Authorization: Bearer <token>` cho mọi HTTP request từ tất cả MFE mà không phải viết lại logic ở từng app. |
| **`MockApiInterceptor`** | HTTP Interceptor | **Giả lập dữ liệu dùng chung:** Bắt request và trả dữ liệu giả lập cho toàn bộ ứng dụng trong quá trình phát triển local, giúp độc lập với backend. |
| **`BaseApiService` / `BaseLoadingService`** | Base Service | **Tái sử dụng & Thống nhất API:** Thống nhất cách thức gọi HTTP request và quản lý trạng thái tải (Loading spinner) trên toàn bộ hệ thống. |

#### 🔄 Sơ đồ luồng HTTP request xuyên biên giới MFE

```
┌──────────────────────────────────────────────────────────┐
│  MFE Dashboard / ProjectsComponent                       │
│  ProjectsService.getProjects() → HttpClient.get(...)    │
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
│  - Match URL /api/projects → Trả mock data từ bộ nhớ     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Response trả về ProjectsComponent → Signals update UI   │
└────────────────────────┬─────────────────────────────────┘
```

---

### 5.2. `libs/ui` (`@ui`) — Giao diện & Styling System

| Tài nguyên share | Loại | Lý do bắt buộc phải share |
| ---------------- | ---- | ------------------------- |
| **`global.scss`** | SCSS Stylesheet | **Đồng bộ thiết kế (Branding):** Chứa CSS variables, Tailwind directives và quy tắc ghi đè Telenor Design System (`tds-ui`). Giúp tất cả MFE có cùng màu sắc, font chữ và trải nghiệm UI thống nhất mà không phải định dạng lại từng app. |
| **`CardComponent`** | UI Component | **Chuẩn hóa khung hiển thị:** Thống nhất bố cục Card (Header, Body, Footer) và hiệu ứng thị giác trên toàn hệ thống. |
| **`BadgeComponent`** | UI Component | **Chuẩn hóa nhãn trạng thái:** Thống nhất màu sắc các nhãn trạng thái (`success`, `warning`, `danger`, `info`) ở tất cả các trang. |
| **`SpinnerComponent`** | UI Component | **Tải trang đồng bộ:** Đảm bảo biểu tượng loading hiển thị giống hệt nhau khi tải bất kỳ MFE hay dữ liệu async nào. |
| **Toast Notification Styles** | SCSS Rule | **Đồng bộ thông báo:** Đảm bảo kích thước (`340px`), viền màu trạng thái và vị trí Toast giống hệt nhau dù phát ra từ MFE nào. |
| **Close Button Styles** | SCSS Rule | **Đồng bộ nút đóng:** Thống nhất kích thước `24×24px` và hiệu ứng hover nút đóng trên các Modal/Drawer. |

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

**Phân biệt mục đích giữa `shared` và `singleton: true`**:

- **Mục đích của việc Share (`shared`):** **Tối ưu dung lượng (Bundle Deduplication)**  
  → Giúp các MFE dùng chung file bundle thay vì mỗi Remote tự đóng gói (bundle) lại thư viện đó vào build output của mình, giảm dung lượng tải qua mạng.

- **Mục đích của `singleton: true`:** **Đảm bảo 1 Instance duy nhất trong bộ nhớ ở Runtime (Single Memory Instance)**  
  → Bắt buộc Webpack chỉ khởi tạo **đúng 1 instance duy nhất trong bộ nhớ (memory)** cho package đó trên toàn bộ ứng dụng, kể cả khi các MFE được load động vào thời điểm khác nhau.  
  → **Lý do bắt buộc cho `@angular/*`, `rxjs`, `@core`:**  
    - Angular quản lý trạng thái qua Dependency Injection (DI) Container và Zone.js. Nếu tồn tại nhiều hơn 1 instance của `@angular/core` trong bộ nhớ, DI Container sẽ bị vỡ, làm sai lệch `ChangeDetectorRef` và biến các Service `providedIn: 'root'` thành nhiều bản thể riêng biệt.  
    - RxJS `Subject` / `Observable` và `EventBusService` bắt buộc phải chạy trên cùng 1 instance memory để sự kiện Pub/Sub liên-MFE hoạt động chính xác.

- **Mục đích của `strictVersion: false`:** **Linh hoạt phiên bản trong môi trường Dev**  
  → Cho phép minor version drift giữa Host và Remote (ví dụ Host dùng `@angular/core@18.2.0`, Remote dùng `@angular/core@18.2.1`) mà Webpack vẫn ép buộc dùng chung 1 instance thay vì tự động load bản fallback thứ 2.

> ⚠️ **Lưu ý**: `strictVersion: false` hỗ trợ linh hoạt khi dev local, nhưng trong môi trường Production nên đặt `strictVersion: true` để đảm bảo tuyệt đối tính đồng nhất phiên bản.

#### 🔄 Sơ đồ luồng Singleton Resolution

```
┌──────────────────────────────────────────────────────────┐
│  Host Bundle (app-shell)                                 │
│  - @angular/core@18.2.0  ← singleton instance #1         │
│  - rxjs@7.8.0            ← singleton instance #2         │
│  - tds-ui@18.6.2         ← singleton instance #3         │
│  - @core                 ← singleton instance #4         │
│  - @ui                   ← singleton instance #5         │
│                          │ (Shared scope)                │
│                          ▼                               │
│  Remote Bundle (mfe-dashboard)                           │
│  - Requests: @angular/core → dùng Instance #1 của Host   │
│  - Requests: rxjs          → dùng Instance #2 của Host   │
│                                                          │
│  ✅ Angular DI container vẫn là 1 cấp duy nhất           │
│  ✅ Services providedIn: 'root' là truly singleton       │
└──────────────────────────────────────────────────────────┘

---



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

| Host Route               | Remote Source                  | Method                                                                                   |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------- |
| `/auth/login`            | `mfe-auth` / `./Login`         | `loadRemoteModule({ type: 'module', remoteName: 'mfe-auth', exposedModule: './Login' })` |
| `/auth/forgot-password`  | `mfe-auth` / `./ForgotPassword`| `loadRemoteModule(...)`                                                                  |
| `/dashboard`             | `mfe-dashboard` / `./Dashboard`| `loadRemoteModule(...)`                                                                  |
| `/projects`              | `mfe-dashboard` / `./Projects` | `loadRemoteModule(...)`                                                                  |
| `/reporting`             | `mfe-reporting` / `./Reporting`| `loadRemoteModule(...)`                                                                  |

#### 💡 Phân biệt các kiểu `import` trong hệ thống

| Tiêu chí so sánh           | Local `import()` (`import('./local')`) | Static Remote `import()` (`import('mfe-auth/Login')`) | Dynamic `loadRemoteModule(...)` (Nx / Manifest Helper) |
| -------------------------- | ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| **Bản chất**               | ESM Dynamic Import nội bộ             | **Webpack Remotes Config Import**                     | **Manifest-driven Dynamic Remote Load**               |
| **Cấu hình URL**           | Đường dẫn tương đối file cục bộ       | Cấu hình cứng URL trong `webpack.config.ts` (`remotes: { 'mfe-auth': 'http://...' }`) | **Đọc động tại Runtime** từ `federation.manifest.json` hoặc API backend |
| **Khai báo Type (d.ts)**   | TypeScript tự nhận biết               | Bắt buộc phải tạo file `decl.d.ts` (`declare module 'mfe-auth/*';`) | Không bắt buộc `decl.d.ts`, load qua Manifest Config |
| **Khả năng đổi Server URL**| Không thể                             | Phải re-build Host nếu đổi IP/Port của Remote         | **Hoàn toàn linh hoạt:** Đổi URL trên Manifest/API mà KHÔNG CẦN re-build Host |

**Tóm lại:**
1. **Local `import()`**: Dùng cho Code Splitting các file `.ts` nội bộ trong cùng 1 project.
2. **Static Remote `import('mfe-name/Module')`**: Dùng Module Federation nhưng URL của remoteEntry.js bị **cố định trong `webpack.config.ts`** lúc build Host.
3. **Dynamic `loadRemoteModule(...)`**: Chuẩn được dự án lựa chọn! Cho phép Host **nạp URL của các Remote MFE một cách hoàn toàn linh hoạt từ Manifest/API** ở Runtime mà không cần build lại Host khi thay đổi môi trường (Dev/Staging/Prod).



### 7.2. EventBus Contract

#### 🛠️ Bản chất triển khai: Tự viết (Custom In-House) vs Thư viện ngoài
EventBus trong hệ thống là **mã nguồn tự phát triển (Custom-built)** đặt tại `libs/core/src/lib/infrastructure/event-bus.service.ts`, kế thừa từ lớp trừu tượng `BaseEventBusService`.

- **Cơ chế hoạt động:** Sử dụng `Subject<MfeEvent<any>>` của RxJS kết hợp toán tử `filter()` để điều phối luồng dữ liệu (Pub/Sub Event Stream).
- **Lý do tự viết thay vì cài thư viện bên thứ 3:**
  1. **Không phụ thuộc thư viện ngoài (Zero External Dependency):** Giảm thiểu rủi ro bảo mật và giữ cho dung lượng bundle size của hệ thống siêu nhẹ.
  2. **Tận dụng tối đa RxJS & Singleton Scope:** Vì `rxjs` đã được cấu hình `singleton: true` trong Module Federation, `EventBusService` tự động chạy trên 1 instance duy nhất trên toàn bộ Host và các Remote MFE mà không cần thiết lập phức tạp.
  3. **Tương thích hoàn hảo với Angular Reactive:** Trả về `Observable<MfeEvent<T>>` giúp các Angular Component dễ dàng áp dụng các toán tử RxJS (`takeUntil`, `map`, `debounceTime`) và quản lý hủy đăng ký (unsubscribe) chuẩn xác.

#### 📋 Danh sách Events và Hợp đồng dữ liệu
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
│  http://localhost:4200                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Angular bootstrap trong App Shell                      │
│  - Tải @angular/core, rxjs, tds-ui từ Host bundle       │
│    (singleton scope)                                    │
│  - Khởi tạo DI container                                │
│  - Tải Layout: Sidebar + Header + RouterOutlet          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Host router resolve route ban đầu                      │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐                    │
│  │ Public route│    │ Protected    │                    │
│  │ /auth/login │    │ /dashboard   │                    │
│  └──────┬──────┘    └──────┬───────┘                    │
│         │                  │                            │
│         ▼                  ▼                            │
│  loadRemoteModule()   authGuard kiểm tra localStorage   │
│  - mfe-auth:4201    - Có token → loadRemoteModule()     │
│  - ./Login          - Không token → redirect /auth/login│
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch remoteEntry.js + shared chunks           │
│  từ dev server của MFE tương ứng                        │
│  (ví dụ: http://localhost:4202/remoteEntry.js)          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Remote module bootstrap                                │
│  - Tiêu thụ @angular/core từ Host (singleton)           │
│  - Injector hierarchy vẫn là 1 cấp                      │
│  - Component render vào RouterOutlet của Host           │
└─────────────────────────────────────────────────────────┘
```

### 8.2. Luồng đăng nhập

```
Người dùng truy cập /auth/login
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  App Shell (Host)                                       │
│  authGuard: /auth/login là public route                 │
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
│  MFE Auth bootstrap trong RouterOutlet                  │
│  LoginComponent hiển thị                                │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng nhập credentials & bấm Đăng nhập
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LoginComponent                                         │
│  → AuthService.login(username, password, role)          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  HttpClient gửi request                                 │
│  → MockApiInterceptor intercept                         │
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
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ App Shell    │  │ mfe-dashboard│  │mfe-reporting  │  │
│  │ Header update│  │ Refresh data │  │ Refresh data  │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Router.navigate(['/dashboard'])                        │
│  → Host chuyển route sang /dashboard                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  authGuard kiểm tra localStorage                        │
│  - Có mfe_jwt_token → CHO PHÉP                          │
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
│  Host router resolves /projects                         │
│  → authGuard: có token → CHO PHÉP                       │
│  → loadRemoteModule('mfe-dashboard', './Projects')      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser fetch mfe-dashboard remoteEntry.js             │
│  ProjectsComponent bootstrap                            │
└────────────────────────┬────────────────────────────────┘
                         │
            Người dùng tạo dự án mới qua Modal
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent                                      │
│  → ProjectsService.create(projectData)                  │
│  → HttpClient POST                                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  MockApiInterceptor                                     │
│  → Lưu project vào mock DB                              │
│  → Trả về project object đã tạo                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ProjectsComponent cập nhật local state                 │
│  → Signals notify re-render                             │
│  → TDSNotificationService.success('Đã tạo thành công')  │
│  → Toast hiển thị ở góc trên bên phải                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  EventBus.emit('PROJECT_CREATED', { project })          │
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
│  ┌────────────────────────────────────────────────┐      │
│  │ @angular/core@18.2.0  ← singleton instance #1  │      │
│  │ rxjs@7.8.0            ← singleton instance #2  │      │
│  │ tds-ui@18.6.2         ← singleton instance #3  │      │
│  │ @core                 ← singleton instance #4  │      │
│  │ @ui                   ← singleton instance #5  │      │
│  └────────────────────────────────────────────────┘      │
│                          │                               │
│                          │ shared scope                  │
│                          ▼                               │
│  ┌────────────────────────────────────────────────┐      │
│  │ Remote Bundle (mfe-dashboard)                  │      │
│  │                                                │      │
│  │  Requests:                                     │      │
│  │  - @angular/core → Host cung cấp instance #1   │      │
│  │  - rxjs          → Host cung cấp instance #2   │      │
│  │  - tds-ui        → Host cung cấp instance #3   │      │
│  │                                                │      │
│  │  Result: Chỉ có 1 @angular/core, 1 rxjs, ...   │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ✅ Angular DI container vẫn là 1 cấp duy nhất           │
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
│  MFE Dashboard / ProjectsComponent                       │
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
│  - Trả về mock data từ bộ nhớ                            │
│  - Không gọi backend thật                                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Response trả về ProjectsComponent                       │
│  → update() trên Signals                                 │
│  → Template tự động re-render                            │
└────────────────────────┬─────────────────────────────────┘
```

### 8.6. Luồng cross-MFE communication qua EventBus

```
┌──────────────────────────────────────────────────────────┐
│                    EventBusService (singleton)           │
│                   In-memory Pub/Sub Channel              │
└──────────────────────────────────────────────────────────┘
                         ▲
                         │ subscribe / emit
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ mfe-auth     │ │ app-shell    │ │mfe-dashboard │
│              │ │              │ │              │
│ emit(        │ │ subscribe(   │ │ emit(        │
│   USER_      │ │   USER_      │ │   PROJECT_   │
│   LOGGED_IN) │ │   LOGGED_IN) │ │   CREATED)   │
│              │ │ → Header     │ │              │
│              │ │   update UI  │ │ subscribe(   │
│              │ │              │ │   PROJECT_   │
│              │ │              │ │   CREATED)   │
│              │ │              │ │ → Refresh    │
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
│  Developer chạy lệnh: npm run build                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Nx affected computation                                 │
│  - Phát hiện project nào bị thay đổi                     │
│  - Xác định dependency graph từ nx.json                  │
│  - Lọc chỉ build những project bị ảnh hưởng              │
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
│  Deploy lên CDN/Static Hosting                           │
│                                                          │
│  - Upload dist/ cho từng app                             │
│  - Đảm bảo remoteEntry.js served với                     │
│    MIME type: application/javascript                     │
│  - Cấu hình CDN preserve chunk filenames                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  User truy cập production URL                            │
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
