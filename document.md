# TÀI LIỆU KIẾN TRÚC VÀ SỔ TAY NHÂN BẢN DỰ ÁN MICRO-FRONTEND

## MASTER SYSTEM ARCHITECTURE & REPLICATION PLAYBOOK

> **Tên hệ thống**: Enterprise Micro-Frontend Portal Workspace
> **Phiên bản**: 2.0.0 (Nx Monorepo + Rsbuild / Rspack + Angular 18 Standalone + Node.js Express Backend)
> **Mục đích tài liệu**: Đây là **Bản thiết kế chi tiết** và **Sổ tay hướng dẫn** để bạn hiểu hệ thống hiện tại, vận hành từng phần, và nhân bản lại cho dự án mới. Tài liệu chia thành **2 phần chính**: phần lớn tập trung vào **Kiến trúc Frontend Micro-Frontend**, phần còn lại bổ trợ **Máy chủ API Backend**.

---

## 📌 MỤC LỤC TỔNG QUAN

### 🔵 PHẦN I: PHẦN KIẾN TRÚC FRONTEND (MICRO-FRONTEND MONOREPO - TRỌNG TÂM DỰ ÁN)
1. [TỔNG QUAN NGHIỆP VỤ & MÔ HÌNH MICRO-FRONTEND](#1-tổng-quan-nghiệp-vụ--mô-hình-micro-frontend)
2. [SƠ ĐỒ CẤU TRÚC MÃ NGUỒN FRONTEND (DIRECTORY TOPOLOGY)](#2-sơ-đồ-cấu-trúc-mã-nguồn-frontend-directory-topology)
3. [ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ MFE APPS & SƠ ĐỒ UML FLOW](#3-đặc-tả-chi-tiết-các-phân-hệ-mfe-apps--sơ-đồ-uml-flow)
   - [3.1. App Shell Gateway (Host - Port `4200`) & Sơ đồ UML Sequence Flow](#31-app-shell-gateway-host---port-4200--sơ-đồ-uml-sequence-flow)
   - [3.2. Cơ chế Export tại Remote và Dynamic Loading tại Shell](#32-cơ-chế-export-tại-remote-và-dynamic-loading-tại-shell)
   - [3.3. Remote MFE Auth (Port `4201`)](#33-remote-mfe-auth-port-4201)
   - [3.4. Remote MFE Dashboard (Port `4202`)](#34-remote-mfe-dashboard-port-4202)
   - [3.5. Remote MFE Reporting (Port `4203`)](#35-remote-mfe-reporting-port-4203)
4. [ĐẶC TẢ THƯ VIỆN LÕI CORE (`libs/core`) & UI (`libs/ui`)](#4-đặc-tả-thư-viện-lõi-core-libscore--ui-libsui)
   - [4.1. Nhiệm vụ & Lý do Tách biệt Hai Thư viện Dùng chung](#41-nhiệm-vụ--lý-do-tách-biệt-hai-thư-viện-dùng-chung)
   - [4.2. Chi tiết 3 Trụ cột `@microfrontend/core`](#42-chi-tiết-3-trụ-cột-microfrontendcore)
   - [4.3. Chi tiết Thư viện UI Component `@microfrontend/ui`](#43-chi-tiết-thư-viện-ui-component-microfrontendui)
5. [HƯỚNG DẪN CẤU HÌNH RSBUILD (`rsbuild.config.ts`) VÀ PIPELINE BUILD](#5-hướng-dẫn-cấu-hình-rsbuild-rsbuildconfigts-và-pipeline-build)
   - [5.1. Công nghệ Rsbuild + Rspack (Rust-based) cho Angular](#51-công-nghệ-rsbuild--rspack-rust-based-cho-angular)
   - [5.2. Mẫu Cấu hình Host App Shell (`apps/app-shell/rsbuild.config.ts`)](#52-mẫu-cấu-hình-host-app-shell-appsapp-shellrsbuildconfigts)
   - [5.3. Mẫu Cấu hình Remote MFE Apps (`apps/mfe-auth/rsbuild.config.ts`)](#53-mẫu-cấu-hình-remote-mfe-apps-appsmfe-authrsbuildconfigts)
   - [5.4. Hệ thống Scripts Vận hành Dev & Build Production](#54-hệ-thống-scripts-vận-hành-dev--build-production)
   - [5.5. Bảng So sánh Hiệu năng](#55-bảng-so-sánh-hiệu-năng)
6. [CƠ CHẾ GIAO TIẾP EVENTBUS, CHIA SẺ STYLE, CHIA SẺ STATE VÀ LUỒNG BFF CALL](#6-cơ-chế-giao-tiếp-eventbus-chia-sẻ-style-chia-sẻ-state-và-luồng-bff-call)
   - [6.1. Cơ chế Bắn & Đăng ký Sự kiện qua EventBus](#61-cơ-chế-bắn--đăng-ký-sự-kiện-qua-eventbus)
   - [6.2. Cơ chế Chia sẻ Style SCSS & Design Tokens](#62-cơ-chế-chia-sẻ-style-scss--design-tokens)
   - [6.3. Cơ chế Chia sẻ Trạng thái (Shared State)](#63-cơ-chế-chia-sẻ-trạng-thái)
   - [6.4. Luồng Gọi API dạng BFF / API Gateway](#64-luồng-gọi-api-dạng-bff--api-gateway)
7. [HƯỚNG DẪN NHÂN BẢN DỰ ÁN MỚI (REPLICATION GUIDE)](#7-hướng-dẫn-nhân-bản-dự-án-mới)

### 🟢 PHẦN II: PHẦN MÁY CHỦ BỔ TRỢ BACKEND (EXPRESS NODE.JS API SERVER)
8. [TỔNG QUAN VAI TRÒ BACKEND & VẬN HÀNH GATEWAY PROXY](#8-tổng-quan-vai-trò-backend--vận-hành-gateway-proxy)
9. [BẢNG CHI TIẾT TẤT CẢ CÁC ENDPOINTS & TRÁCH NHIỆM API](#9-bảng-chi-tiết-tất-cả-các-endpoints--trách-nhiệm-api)
10. [MIDDLEWARE BẢO MẬT `authenticateToken` (MÃ LỖI `401 UNAUTHORIZED`)](#10-middleware-bảo-mật-authenticatetoken)

---

# 🔵 PHẦN I: PHẦN KIẾN TRÚC FRONTEND (MICRO-FRONTEND MONOREPO - TRỌNG TÂM DỰ ÁN)

## 1. TỔNG QUAN NGHIỆP VỤ & MÔ HÌNH MICRO-FRONTEND

### 1.1. Mục đích của Kiến trúc Frontend này
Hệ thống Frontend được thiết kế theo mô hình **Micro-Frontend (MFE)** nhằm chia nhỏ một giao diện quản trị phức tạp thành các ứng dụng độc lập, có thể phát triển và triển khai riêng nhau nhưng vẫn hoạt động như một hệ thống thống nhất.

1. **`app-shell` (Port `4200`)**: Cổng điều hướng trung tâm. Chứa bộ khung giao diện chính như Header, Sidebar, chịu trách nhiệm nạp động các Remote MFE, điều phối Router và đóng vai trò API Gateway.
2. **`mfe-auth` (Port `4201`)**: Phân hệ Đăng nhập, SSO, Quên mật khẩu, Quản lý Token phiên làm việc.
3. **`mfe-dashboard` (Port `4202`)**: Phân hệ Bảng thống kê KPI và Bảng Kanban Quản lý Dự án.
4. **`mfe-reporting` (Port `4203`)**: Phân hệ Báo cáo chuyên sâu và Xuất dữ liệu Excel/PDF.

### 1.2. Mức trưởng thành của giải pháp
- Repo hiện tại đang ở **Stage 3: Nx + Module Federation + Rsbuild**.
- Mục tiêu ngắn hạn là ổn định kiến trúc hybrid này.
- **Stage 4: Plugin Super App** chỉ nên cân nhắc khi team >10 người và có 5+ domain plugins độc lập.

---

## 2. SƠ ĐỒ CẤU TRÚC MÃ NGUỒN FRONTEND (DIRECTORY TOPOLOGY)

```text
apps/
├── app-shell/                          # Ứng dụng Host Cổng trung tâm (Port 4200)
│   ├── rsbuild.config.ts               # Cấu hình Rsbuild Host & Module Federation
│   ├── src/
│   │   ├── main.ts                     # Khởi chạy SSR/browser boundary
│   │   ├── bootstrap.ts                # bootstrapApplication(App, appConfig)
│   │   ├── server.ts                   # Express + SSR + /api proxy
│   │   └── app/
│   │       ├── app.config.ts           # provideRouter, provideHttpClient, provideClientHydration
│   │       ├── app.routes.ts           # Route tổng + loadRemoteModule
│   │       └── pages/                  # Layout components, guards, error pages
│
├── mfe-auth/                           # Ứng dụng Remote Xác thực (Port 4201)
│   ├── rsbuild.config.ts               # Cấu hình Rsbuild Remote + expose Routes
│   ├── src/
│   │   ├── main.ts                     # Async boundary: import('./bootstrap')
│   │   ├── bootstrap.ts                # bootstrapApplication(AppComponent, appConfig)
│   │   └── app/
│   │       ├── app.config.ts           # provideRouter, provideHttpClient
│   │       ├── app.routes.ts           # Route nội bộ MFE
│   │       └── pages/login/            # Login, forgot-password
│
├── mfe-dashboard/                      # Ứng dụng Remote Dashboard (Port 4202)
│   ├── rsbuild.config.ts
│   └── src/app/pages/                  # Dashboard, Projects, Calendar
│
└── mfe-reporting/                      # Ứng dụng Remote Reporting (Port 4203)
    ├── rsbuild.config.ts
    └── src/app/pages/                  # Reporting

libs/
├── core/                               # Thư viện Logic Lõi (@microfrontend/core)
│   ├── index.ts                        # Public Barrel Export
│   └── src/lib/
│       ├── services/
│       │   ├── event-bus.service.ts    # Cross-MFE pub/sub
│       │   └── remote-style.service.ts # Style isolation cho remote MFE
│       ├── infrastructure/
│       │   ├── http/                   # BaseApiService, interceptors
│       │   └── storage/                # Storage adapter
│       ├── guards/                     # AuthGuard, GuestGuard
│       └── providers.ts                # provideCore(...)
│
└── ui/                                 # Thư viện UI Component (@microfrontend/ui)
    ├── index.ts                        # Public Barrel Export
    └── src/lib/
        ├── components/                 # Spinner, Badge, Card
        └── styles/                     # tokens.scss, base.scss

shared/
└── federation.shared.ts                # Singleton mappings cho shared deps

backend/                                # Express API Server (Port 3000)
├── src/
│   ├── index.ts                        # Khởi tạo Express
│   ├── server.ts                       # Không dùng; dev dùng tsx trực tiếp
│   └── routes/                         # Auth, Dashboard, Reporting endpoints
```

---

## 3. ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ MFE APPS & SƠ ĐỒ UML FLOW

### 3.1. App Shell Gateway (Host - Port `4200`) & Sơ đồ UML Sequence Flow

`app-shell` là **Cổng điều hướng trung tâm**. Nó chứa Header, Sidebar, bảo vệ route và nạp các MFE từ xa.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       Trình duyệt Người dùng                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (HTTP Port 4200)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    App Shell Gateway (Host - Port 4200)                 │
│              Chứa Container Layout, Header, Sidebar, Router             │
└───────┬────────────────────────────┬────────────────────────────┬───────┘
        │ Dynamic Load               │ Dynamic Load               │ Dynamic Load
        │ /auth/login                │ /dashboard                  │ /reporting
        ▼                            ▼                            ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  Remote MFE Auth     │   │ Remote MFE Dashboard │   │ Remote MFE Reporting │
│    (Port 4201)       │   │    (Port 4202)       │   │    (Port 4203)       │
│  Login, SSO, Token   │   │ KPI, Kanban Projects │   │ Reports, Export PDF  │
└───────┬──────────────┘   └───────┬──────────────┘   └───────┬──────────────┘
        │                          │                          │
        │ Gọi /api                 │ Gọi /api                 │ Gọi /api
        └──────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    App Shell Gateway (Host - Port 4200)                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Proxy /api -> backend:3000
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Express Backend Server (Node.js - Port 3000)             │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 📊 Sequence Flowchart - Luồng đăng nhập và tải dashboard

```text
[Người dùng]      [App Shell 4200]       [AuthGuard]        [Load MFE]        [MFE]             [Backend 3000]
     │                  │                    │                  │                │                    │
(1) Mở /dashboard    │                    │                  │                │                    │
     ├───────────────►│                    │                  │                │                    │
(2)                 │ Kiểm tra Guard     │                  │                │                    │
     │               ├───────────────────►│                  │                │                    │
(3a) Chưa đăng nhập │◄── Chưa có token ──┤                  │                │                    │
     │               │ Redirect sang /auth/login                │                │                    │
     │◄──────────────┤                    │                  │                │                    │
     │               │                    │                  │                │                    │
     │  Truy cập /auth/login             │                  │                │                    │
     ├──────────────────────────────────►│                  │                │                    │
     │               │  Nạp mfe-auth      │                  │                │                    │
     │               ├───────────────────────────────────────►│                │                    │
     │               │                    │                  ├── Load remoteEntry.js ─────────────►│
     │               │                    │                  │                │◄── Trả về Routes ─┼
     │               │                    │                  ├── Khởi chạy LoginComponent ─────────►│
     │               │                    │                  │                │                    │
     │  Nhập email/password, nhấn Sign In                        │                │                    │
     │               │                    │                  │                ├── POST /api/auth/login ──────►│
     │               │                    │                  │                │                    │◄── Trả JWT + User
     │               │◄─────────────────────────────────────────┴────────────────┴────────────────────┘
     │               │ Sau khi có token, chuyển hướng về /dashboard
     ├────────────────────────────────────────────────────────────────────────────────────────────────►│
     │               │ Tải dashboard, sau đó gọi /api/dashboard/...                                        │
     │               │──────────────────────────────────────────────────────────────────────────────────►│
     │               │◄──────────────────────────────────────────────────────────────────────────────────┘
     │◄── Render Dashboard UI ───────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2. Cơ chế Export tại Remote và Dynamic Loading tại Shell

**Remote exposes route entry**:
- Mỗi remote MFE chỉ expose **một entry chính** là `./Routes`, trỏ tới file `app.routes.ts` trong app đó.
- Shell không cần biết chi tiết bên trong MFE, chỉ cần tải entry này rồi nhét vào `loadChildren`.

**Shell dynamic load**:
- Shell dùng `loadRemoteModule('mfe-auth', './Routes')` để nạp remote động.
- Khi shell gặp route `/auth`, nó sẽ lấy `remoteEntry.js` của remote tương ứng và khởi chạy routes bên trong MFE.

Điều này giúp:
- MFE phát triển độc lập.
- Shell không import thẳng mã nguồn MFE, chỉ giao tiếp qua contract `remoteEntry.js` + `exposes`.

---

### 3.3. Remote MFE Auth (Port `4201`)
- **Màn hình chính**: `LoginComponent` đăng nhập bằng email/password, hỗ trợ hiển thị/ẩn mật khẩu, checkbox "Remember me for 30 days".
- **SSO**: `onSsoLogin()` gọi endpoint giả lập SSO.
- **Trạng thái loading**: khi nhấn Sign In, nút sẽ hiển thị spinner để chặn người dùng nhấn lại trong khi đang gọi API.
- **Sau khi đăng nhập thành công**:
  - Lưu user + token vào `localStorage`.
  - Phát sự kiện `USER_LOGGED_IN` để các MFE khác biết.
  - Chuyển hướng về `/dashboard`.
- **Forgot Password**: trang `forgot-password` cho phép yêu cầu reset mật khẩu.

---

### 3.4. Remote MFE Dashboard (Port `4202`)
- **`DashboardComponent`**: Hiển thị KPI tổng thể, biểu đồ chỉ số doanh thu & hiệu suất.
- **`ProjectsComponent`**: Bảng Kanban quản lý dự án công việc (`/projects`).
- **4 File SCSS Themes Export**:
  - `./ThemeStyle` ➔ `shared-theme.scss` (Crimson Master Theme)
  - `./DarkGlassTheme` ➔ `dark-glass.scss` (Dark Glassmorphism Theme)
  - `./NeonCyanTheme` ➔ `neon-cyan.scss` (Cyberpunk Neon Cyan Theme)
  - `./CorporateBlueTheme` ➔ `corporate-blue.scss` (Corporate Blue Theme)

---

### 3.5. Remote MFE Reporting (Port `4203`)
- **`ReportingComponent`**: Báo cáo chuyên sâu, xuất Excel/PDF, phân trang động.
- **`SharedStylesComponent`**: Trang trưng bày & kiểm thử các loại Style SCSS dùng chung (`/shared-styles`), trực tiếp tiêu thụ và nạp động 4 SCSS themes được expose từ `mfe-dashboard`.

---

## 4. ĐẶC TẢ THƯ VIỆN LÕI CORE (`libs/core`) & UI (`libs/ui`)

### 4.1. Nhiệm vụ & Lý do Tách biệt Hai Thư viện Dùng chung
- **Tránh trùng lặp mã nguồn**: 4 MFE không cần viết lại logic chung như http client, storage, auth guard.
- **Đồng nhất thương hiệu**: đảm bảo 100% MFE dùng chung tokens màu, font, spacing.
- **`@microfrontend/core` (`libs/core`)**: đóng vai trò **Bộ não Nghiệp vụ & Hạ tầng Lõi**.
- **`@microfrontend/ui` (`libs/ui`)**: đóng vai trò **Bộ Thiết kế Giao diện Chuẩn Doanh nghiệp**.

---

### 4.2. Chi tiết 3 Trụ cột `@microfrontend/core`

1. **`infrastructure/http` (API & Bảo mật)**:
   - `BaseApiService`: lớp cơ sở cho mọi API call, tự động đính kèm header `X-Context-ID`, `returnUrl`, và Bearer token.
   - `AuthorizationTokenInterceptor`: đọc token từ storage rồi thêm vào header `Authorization`.
   - `CRUDResult<T>`: chuẩn hóa cấu trúc JSON trả về từ backend.

2. **`services` (Điều phối & Sự kiện)**:
   - `EventBusService`: cho phép MFE giao tiếp với nhau qua event `USER_LOGGED_IN`, `USER_LOGGED_OUT` mà không cần import trực tiếp nhau.
   - `RemoteStyleService` / `RemoteStyleModel`: quản lý việc nạp style của remote MFE một cách cô lập, tránh CSS leaking.

3. **`guards` + `providers.ts` (Bảo vệ & Cấu hình)**:
   - `AuthGuard`: chặn route có `canActivate: [AuthGuard]` nếu chưa đăng nhập.
   - `GuestGuard`: chặn route công khai nếu đã đăng nhập, chuyển hướng về `/dashboard`.
   - `provideCore()`: đăng ký tập trung các provider như `HttpClient`, router, animation, `TDS_I18N`.

---

### 4.3. Chi tiết Thư viện UI Component `@microfrontend/ui`
- **`SpinnerComponent` (`<ui-spinner>`)**: hiển thị vòng tròn quay khi đang tải dữ liệu. Hỗ trợ 2 màu: `primary` mặc định và `white` cho nền đỏ.
- **`BadgeComponent` (`<ui-badge>`)**: thẻ nhãn trạng thái.
- **`CardComponent` (`<ui-card>`)**: container có shadow, title, subtitle.
- **SCSS Tokens**: quản lý tập trung màu sắc, font-size, spacing theo design system TDS.

---

## 5. HƯỚNG DẪN CẤU HÌNH RSBUILD (`rsbuild.config.ts`) VÀ PIPELINE BUILD

### 5.1. Công nghệ Rsbuild + Rspack (Rust-based) cho Angular
- **Rsbuild** là build tool xây trên **Rspack**, bundler viết bằng Rust, tương thích gần như toàn bộ API Webpack 5.
- **Lợi ích thực tế**: build nhanh hơn rất nhiều, HMR gần như istant.
- **Module Federation**: dùng `@module-federation/enhanced/rspack` với `ModuleFederationPlugin`.
- **Lưu ý quan trọng**: hiện tại không dùng `@ng-rsbuild/plugin-angular` hay `module-federation.config.ts`. Mọi cấu hình federation đặt trực tiếp trong `rsbuild.config.ts`.

---

### 5.2. Mẫu Cấu hình Host App Shell (`apps/app-shell/rsbuild.config.ts`)

```ts
import path from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { sharedMappings } from '../../shared/federation.shared';

export default defineConfig({
  plugins: [pluginSass()],
  html: {
    template: path.resolve(__dirname, 'src/index.html'),
  },
  source: {
    entry: { index: path.resolve(__dirname, 'src/main.ts') },
    tsconfigPath: path.resolve(__dirname, '../../tsconfig.base.json'),
  },
  resolve: {
    alias: {
      '@microfrontend/core': path.resolve(__dirname, '../../libs/core/src/index.ts'),
      '@microfrontend/ui': path.resolve(__dirname, '../../libs/ui/src/index.ts'),
    },
  },
  server: {
    port: 4200,
    cors: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  dev: {
    hmr: true,
    client: { port: 4200 },
  },
  output: {
    assetPrefix: 'http://localhost:4200/',
    distPath: { root: path.resolve(__dirname, '../../dist/apps/app-shell') },
  },
  tools: {
    lightningcssLoader: false,
    postcss: (config) => {
      config.postcssOptions = {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      };
    },
    rspack: (config, { appendPlugins }) => {
      config.output = config.output || {};
      config.output.uniqueName = 'app_shell';
      config.output.publicPath = 'http://localhost:4200/';
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      // Ánh xạ .html trong src/app thành raw text để Angular đọc template
      config.module.rules.push({ test: /\.html$/, include: /src\/app\//, type: 'asset/source' });
      // Loader biến Angular component template/style thành module hợp lệ
      config.module.rules.push({
        test: /\.ts$/,
        include: /src\/app\//,
        use: [{ loader: path.resolve(__dirname, '../../shared/angular-component-loader.cjs') }],
      });
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'app_shell',
          remotes: {
            'mfe-auth': 'mfe_auth@http://localhost:4201/remoteEntry.js',
            'mfe-dashboard': 'mfe_dashboard@http://localhost:4202/remoteEntry.js',
            'mfe-reporting': 'mfe_reporting@http://localhost:4203/remoteEntry.js',
          },
          shared: sharedMappings,
        }),
      ]);
    },
  },
});
```

**Ý nghĩa các điểm quan trọng:**
- `remotes`: shell khai báo rõ remote nào chạy port nào.
- `shared`: đảm bảo các thư viện chung chỉ tồn tại 1 bản duy nhất.
- `proxy`: trong dev, shell proxy `/api` sang backend `3000`.

---

### 5.3. Mẫu Cấu hình Remote MFE Apps (`apps/mfe-auth/rsbuild.config.ts`)

```ts
import path from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { sharedMappings } from '../../shared/federation.shared';

export default defineConfig({
  plugins: [pluginSass()],
  html: { template: path.resolve(__dirname, 'src/index.html') },
  source: {
    entry: { index: path.resolve(__dirname, 'src/main.ts') },
    tsconfigPath: path.resolve(__dirname, '../../tsconfig.base.json'),
  },
  resolve: {
    alias: {
      '@microfrontend/core': path.resolve(__dirname, '../../libs/core/src/index.ts'),
      '@microfrontend/ui': path.resolve(__dirname, '../../libs/ui/src/index.ts'),
    },
  },
  server: { port: 4201, cors: true },
  dev: { hmr: true, client: { port: 4201 } },
  output: {
    assetPrefix: 'http://localhost:4201/',
    distPath: { root: path.resolve(__dirname, '../../dist/apps/mfe-auth') },
  },
  tools: {
    lightningcssLoader: false,
    postcss: (config) => {
      config.postcssOptions = {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      };
    },
    rspack: (config, { appendPlugins }) => {
      config.output = config.output || {};
      config.output.uniqueName = 'mfe_auth';
      config.output.publicPath = 'http://localhost:4201/';
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push(
        { test: /\.html$/, include: /src\/app\//, type: 'asset/source' },
        {
          test: /\.ts$/,
          include: /src\/app\//,
          use: [{ loader: path.resolve(__dirname, '../../shared/angular-component-loader.cjs') }],
        }
      );
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'mfe_auth',
          filename: 'remoteEntry.js',
          exposes: {
            './Routes': path.resolve(__dirname, 'src/app/app.routes.ts'),
          },
          shared: sharedMappings,
        }),
      ]);
    },
  },
});
```

**Điểm khác biệt với Host Shell:**
- Remote có `exposes`, không có `remotes`.
- Remote có `filename: 'remoteEntry.js'`.
- Remote expose duy nhất `./Routes`.

---

### 5.4. Hệ thống Scripts Vận hành Dev & Build Production

Scripts thực tế trong `package.json`:

```json
{
  "start": "npm run start:all",
  "start:all": "concurrently ... npm:start:backend npm:rsbuild:auth npm:rsbuild:dashboard npm:rsbuild:reporting npm:rsbuild:shell",
  "start:backend": "npx tsx backend/src/index.ts",
  "start:shell": "npx rsbuild dev --config apps/app-shell/rsbuild.config.ts",
  "start:mfe-auth": "npx rsbuild dev --config apps/mfe-auth/rsbuild.config.ts",
  "start:mfe-dashboard": "npx rsbuild dev --config apps/mfe-dashboard/rsbuild.config.ts",
  "start:mfe-reporting": "npx rsbuild dev --config apps/mfe-reporting/rsbuild.config.ts",
  "build:all": "npx nx run-many -t build --all",
  "build:lib": "npx nx run-many -t build --projects=core,ui"
}
```

**Cách chạy dev thực tế:**
- `npm run start:all`: chạy 5 tiến trình cùng lúc: backend + 3 MFE + shell.
- Hoặc chạy từng cái riêng để tiết kiệm tài nguyên.

---

### 5.5. Bảng So sánh Hiệu năng

| Chỉ số | Monolith cũ | Hiện tại Rsbuild/Rspack + MFE | Ý nghĩa |
|--------|-------------|-------------------------------|---------|
| **Khởi chạy Dev Server** | chậm | nhanh hơn nhiều | Tập trung phát triển từng MFE |
| **HMR** | chậm | gần như istant | Làm việc mượt hơn |
| **Build Production** | lâu | nhanh hơn nhiều | CI/CD hiệu quả hơn |
| **RAM khi Dev** | cao | thấp hơn đáng kể | Tiết kiệm tài nguyên máy |
| **Tải trang ban đầu** | tải toàn bộ | chỉ tải shell + route cần | Tốc độ trang tốt hơn |
| **Chuyển trang** | reload toàn trang | dynamic load + cache | Trải nghiệm gần như native app |

---

## 6. CƠ CHẾ GIAO TIẾP EVENTBUS, CHIA SẺ STYLE, CHIA SẺ STATE VÀ LUỒNG BFF CALL

### 6.1. Cơ chế Bắn & Đăng ký Sự kiện qua EventBus
- **Bài toán**: MFE này không import trực tiếp MFE kia, nhưng vẫn cần thông báo "đăng nhập thành công".
- **Giải pháp**: dùng `EventBusService` trong `@microfrontend/core`. Đây là pub/sub in-memory dùng RxJS `Subject`.
- **Ví dụ thực tế**:
  - `mfe-auth` bắn:
    ```ts
    this.eventBus.emit({
      type: 'USER_LOGGED_IN',
      payload: user,
      sourceRemote: 'mfe-auth',
      timestamp: Date.now(),
    });
    ```
  - `app-shell` hoặc MFE khác lắng nghe:
    ```ts
    this.eventBus.on<User>('USER_LOGGED_IN').subscribe((event) => {
      console.log('Đăng nhập từ:', event.sourceRemote);
    });
    ```

---

### 6.2. Hướng Dẫn Chi Tiết Kiến Trúc & Cơ Chế Chia Sẻ Style Trực Tiếp (Cross-MFE Style Sharing)

Hệ thống hỗ trợ 3 mô hình chia sẻ Style linh hoạt từ tĩnh (Build-time) tới động (Runtime Dynamic Load) với cơ chế cô lập Style (Scope Isolation) tuyệt đối:

#### 1. Mô Hình 3 Cấp Độ Chia Sẻ Style

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ CẤP ĐỘ 1: BUILD-TIME SHARED TOKENS (@microfrontend/ui)                                   │
│ SCSS Design Tokens (màu sắc, font, spacing) được import tĩnh vào từng MFE khi compile   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ CẤP ĐỘ 2: RUNTIME DYNAMIC REMOTE STYLE LOADING (Module Federation Expose)                 │
│ Remote MFE (e.g. mfe-dashboard) đóng gói & expose file style qua Module Federation      │
│ Consumer MFE (e.g. mfe-reporting) dùng RemoteStyleService nạp động qua mạng             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ CẤP ĐỘ 3: SCOPE ISOLATION & CLEANUP LIFECYCLE (Anti CSS-Leaking)                         │
│ Style bọc trong Class Scope độc lập (.mfe-theme-dark-glass, .mfe-theme-neon-cyan,...).  │
│ Tự động inject/remove <style> tag và scope class trên container element khi Component Destroy.│
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Chi Tiết Thực Thi Kỹ Thuật & Code Mẫu

##### 🟢 A. Định nghĩa Contract tại `@microfrontend/core`
File [`libs/core/src/lib/mfe/remote-style.model.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/libs/core/src/lib/mfe/remote-style.model.ts) & [`libs/core/src/lib/mfe/remote-style.service.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/libs/core/src/lib/mfe/remote-style.service.ts):

```ts
// 1. Interface cấu hình nạp style
export interface RemoteStyleConfig {
  mfeName: string;         // Tên remote MFE ('mfe-dashboard')
  exposedModule?: string;  // Entry point exposed ('./SharedStyle')
  className?: string;      // Tên class selector cần nạp ('mfe-theme-dark-glass')
  fileName?: string;       // Tên file SCSS
  styleType?: 'js-module' | 'scss' | 'css-variables';
}

// 2. Abstract Class hợp đồng
export abstract class AbstractRemoteStyleLoader {
  public abstract loadRemoteStyle(config: RemoteStyleConfig): Promise<void>;
  public abstract unloadRemoteStyle(config: RemoteStyleConfig): void;
  public abstract isStyleLoaded(config: RemoteStyleConfig): boolean;
}
```

##### 🟢 B. Đóng gói & Expose Style tại Provider Remote (`apps/mfe-dashboard`)
File [`apps/mfe-dashboard/module-federation.config.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/apps/mfe-dashboard/module-federation.config.ts):
```ts
export default {
  name: 'mfe-dashboard',
  exposes: {
    './Routes': './apps/mfe-dashboard/src/app/app.routes.ts',
    './SharedStyle': './apps/mfe-dashboard/src/app/styles/remote-style.ts', // Expose Style Entry
  }
};
```

File Master Aggregator [`apps/mfe-dashboard/src/app/styles/remote-style.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/apps/mfe-dashboard/src/app/styles/remote-style.ts):
```ts
import { injectStyleElement, removeStyleElement } from '@core';
import './shared-theme.scss';
import './dark-glass.scss';
import './neon-cyan.scss';
import './corporate-blue.scss';

export const STYLE_REGISTRY: Record<string, { className: string; themeName: string; cssContent: string }> = {
  'mfe-theme-dark-glass': {
    className: 'mfe-theme-dark-glass',
    themeName: 'Dark Glassmorphism Theme',
    cssContent: `.mfe-theme-dark-glass { background: #0F172A !important; color: #F8FAFC !important; } ...`
  },
  // ... các theme khác
};

// API Nạp style được gọi từ RemoteStyleService
export async function loadStyle(targetClass?: string): Promise<void> {
  if (typeof document === 'undefined') return;
  const key = targetClass || 'mfe-shared-card';
  const item = STYLE_REGISTRY[key];
  if (item) injectStyleElement(key, item.cssContent);
}

// API Hủy nạp style khi switch/unmount
export function unloadStyle(targetClass?: string): void {
  if (typeof document === 'undefined') return;
  removeStyleElement(targetClass || 'mfe-shared-card');
}
```

##### 🟢 C. Tiêu thụ Style tại Consumer Component (`apps/mfe-reporting`)
File [`apps/mfe-reporting/src/app/pages/shared-styles/shared-styles.component.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/apps/mfe-reporting/src/app/pages/shared-styles/shared-styles.component.ts):
```ts
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RemoteStyleService, RemoteStyleConfig } from '@core';

@Component({
  selector: 'mfe-reporting-shared-styles-page',
  standalone: true,
  templateUrl: './shared-styles.component.html'
})
export class SharedStylesComponent implements OnInit, OnDestroy {
  private readonly styleService = inject(RemoteStyleService);
  public readonly activeClass = signal<string>('mfe-theme-dark-glass');

  public ngOnInit(): void {
    this.selectStyleClass('mfe-theme-dark-glass');
  }

  public ngOnDestroy(): void {
    // Dọn dẹp Style tag & Scope class khi rời màn hình
    this.styleService.unloadRemoteStyle({
      mfeName: 'mfe-dashboard',
      exposedModule: './SharedStyle',
      className: this.activeClass()
    });
  }

  public selectStyleClass(className: string): void {
    // Gỡ style cũ trước khi nạp style mới
    if (this.activeClass()) {
      this.styleService.unloadRemoteStyle({
        mfeName: 'mfe-dashboard',
        exposedModule: './SharedStyle',
        className: this.activeClass()
      });
    }

    this.activeClass.set(className);

    // Nạp style mới từ Remote MFE
    const config: RemoteStyleConfig = {
      mfeName: 'mfe-dashboard',
      exposedModule: './SharedStyle',
      className,
      styleType: 'js-module'
    };

    this.styleService.loadRemoteStyle(config);
  }
}
```

#### 3. Quy Trình 4 Bước Thêm Một Theme / Style Dùng Chung Mới

Để tạo và chia sẻ một Theme hoặc Style SCSS mới từ Remote MFE cho toàn bộ hệ thống tiêu thụ:

1. **Bước 1**: Tạo file SCSS mới trong Remote App (ví dụ: `apps/mfe-dashboard/src/app/styles/cyber-green.scss`). Bọc tất cả selector trong một scope class unique (ví dụ: `.mfe-theme-cyber-green`).
2. **Bước 2**: Import file SCSS vào file Master Aggregator `remote-style.ts` và đăng ký thêm key vào `STYLE_REGISTRY`:
   ```ts
   'mfe-theme-cyber-green': {
     className: 'mfe-theme-cyber-green',
     themeName: 'Cyber Green Theme',
     cssContent: `.mfe-theme-cyber-green { ... }`
   }
   ```
3. **Bước 3**: Kiểm tra file `module-federation.config.ts` của Remote MFE đã expose `'./SharedStyle'` chưa.
4. **Bước 4**: Tại Consumer MFE, inject `RemoteStyleService` và gọi `this.styleService.loadRemoteStyle({ mfeName: 'mfe-dashboard', exposedModule: './SharedStyle', className: 'mfe-theme-cyber-green' })`.

---

### 6.3. Cơ chế Chia sẻ Trạng thái (Shared State)
- **Bài toán**: user vừa đăng nhập ở `mfe-auth`, các MFE khác cần biết ngay lập tức.
- **Giải pháp**:
  1. Dùng **NgRx Signals** trong `libs/core` để quản lý state dạng signal.
  2. Kết hợp `LocalStorageService` lưu persistent.
  3. Mỗi MFE có thể đọc `currentUser()` từ store chung, hoặc lắng nghe event bus.

---

### 6.4. Luồng Gọi API dạng BFF / API Gateway
- **Quy tắc vàng**: MFE **không** gọi thẳng `http://localhost:3000`.
- **Luồng đúng**:
  ```text
  MFE gọi /api/...
      ↓ trình duyệt resolve về host 4200
  app-shell nhận /api
      ↓ proxy sang backend 3000
  Express xử lý trả JSON
      ↓ forward về
  MFE nhận kết quả
  ```
- **Dev proxy 2-tier**:
  - Khi chạy standalone, MFE dev server cũng proxy `/api` về `http://localhost:4200`.
  - Mục đích: giữ MFE clean, không biết địa chỉ backend thật, tránh CORS.
- **Ứng dụng thực tế**:
  - `mfe-auth` gọi `POST /api/auth/login`.
  - `mfe-dashboard` gọi `GET /api/dashboard/projects`.

---

## 7. HƯỚNG DẪN NHÂN BẢN DỰ ÁN MỚI (REPLICATION GUIDE)

1. **Chuẩn bị workspace**: tạo Nx monorepo, cài đặt Angular 18, Rsbuild, Rspack, Module Federation.
2. **Tạo `libs/core` và `libs/ui`**: copy cấu trúc thư viện dùng chung.
3. **Tạo 4 apps**: `app-shell`, `mfe-auth`, `mfe-dashboard`, `mfe-reporting`. Mỗi app cần `bootstrap.ts` riêng để đảm bảo remote load được động.
4. **Cấu hình `rsbuild.config.ts` cho từng app**:
   - Shell: thêm `remotes` trong `ModuleFederationPlugin`.
   - MFE: thêm `exposes: { './Routes': ... }`.
   - Cả 2 cùng dùng `sharedMappings`.
5. **Wire shell routes**: sửa `apps/app-shell/src/app/app.routes.ts`, thêm route `loadChildren: () => loadRemoteModule('mfe-auth', './Routes')`.
6. **Cấu hình proxy `/api`**:
   - Shell proxy `/api` sang backend.
   - MFE proxy `/api` sang shell.
7. **Chạy thử**: mở `http://localhost:4200/auth/login`, kiểm tra login flow, kiểm tra mỗi MFE nhấn Sign In chỉ tạo đúng 1 request.

---

# 🟢 PHẦN II: PHẦN MÁY CHỦ BỔ TRỢ BACKEND (EXPRESS NODE.JS API SERVER)

## 8. TỔNG QUAN VAI TRÒ BACKEND & VẬN HÀNH GATEWAY PROXY

- Máy chủ Backend chạy **Node.js + Express**, mặc định cổng `3000`.
- Nhiệm vụ: cung cấp REST API cho toàn bộ hệ thống.
- **Quy tắc quan trọng**: Backend **không** tiếp nhận request trực tiếp từ trình duyệt nếu đã có App Shell Gateway. Mọi request `/api` từ MFE phải đi qua shell `4200` trước, shell mới proxy sang `backend:3000`.
- Lợi ích: tập trung xác thực, logging, CORS, security ở một điểm duy nhất.

---

## 9. BẢNG CHI TIẾT TẤT CẢ CÁC ENDPOINTS & TRÁCH NHIỆM API

| Nhóm | Phương thức | Đường dẫn API | Chức năng | Bảo vệ |
|------|-------------|---------------|-----------|--------|
| **Auth** | `POST` | `/api/auth/login` | Nhận email/password, trả về user + JWT token | Public |
| **Auth** | `POST` | `/api/auth/sso-login` | Đăng nhập SSO, trả về user + SSO token | Public |
| **Auth** | `POST` | `/api/auth/reset-password` | Gửi hướng dẫn khôi phục mật khẩu qua email | Public |
| **Dashboard** | `GET` | `/api/dashboard/projects` | Danh sách dự án | Cần token |
| **Dashboard** | `GET` | `/api/dashboard/benchmarks` | Dữ liệu biểu đồ chỉ số so sánh | Cần token |
| **Dashboard** | `GET` | `/api/dashboard/team-performance` | Hiệu suất làm việc của đội ngũ | Cần token |
| **Dashboard** | `GET` | `/api/dashboard/activity-logs` | Nhật ký hoạt động hệ thống | Cần token |
| **Dashboard** | `GET` | `/api/dashboard/kanban-tasks` | Danh sách công việc Kanban | Cần token |
| **Reporting** | `GET` | `/api/reporting/detailed-reports` | Báo cáo chi tiết | Cần token |

**Lưu ý:**
- Public endpoint dùng cho đăng nhập, reset password.
- Các endpoint Dashboard và Reporting đều yêu cầu header `Authorization: Bearer <token>`.
- Nếu token thiếu hoặc sai, backend trả `401 Unauthorized`.

---

## 10. MIDDLEWARE BẢO MẬT `authenticateToken` (MÃ LỖI `401 UNAUTHORIZED`)

- Vai trò: kiểm tra header `Authorization` trước khi cho phép vào endpoint được bảo vệ.
- Cách hoạt động:
  1. Đọc header `authorization`.
  2. Tách chuỗi lấy phần token sau cụm `Bearer `.
  3. Nếu không có token → trả ngay `401`.
  4. Nếu có token → cho qua middleware để route handler xử lý tiếp.

Đây là lớp bảo vệ tối thiểu. Trong thực tế, bạn có thể bổ sung kiểm tra expiry, blacklist token, scope permission...

---

### 📝 KẾT LUẬN
Tài liệu này cố gắng trình bày kiến trúc theo 2 lớp:
- **Lớp 1 - Không code**: giải thích bằng ngôn ngữ kinh doanh: ai làm gì, luồng đi như thế nào, ai gọi ai.
- **Lớp 2 - Chi tiết kỹ thuật**: đưa vào cấu trúc thư mục, code mẫu, config thực tế để kỹ sư có thể vận hành và nhân bản.

Bạn có thể dùng file này làm tài liệu nền cho cả team sản phẩm lẫn team kỹ thuật khi triển khai hoặc mở rộng hệ thống.
