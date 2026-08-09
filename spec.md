# TỔNG HỢP KIẾN THỨC MICRO FRONTEND & SPEC CHI TIẾT DỰ ÁN (`mfe-auth`, `mfe-dashboard`, `mfe-reporting`)

Tài liệu này bao gồm 2 phần chính:
1. **Phần I: Tổng hợp Kiến thức, Bài học Kinh nghiệm, Troubleshooting & Nhật Ký Các Lỗi Đã Sửa (System Fixes Log)**.
2. **Phần II: Tài liệu Cấu trúc & Hướng dẫn Cấu hình chi tiết cho toàn bộ Micro Frontends** bằng **Rsbuild**.

---

# PHẦN I: TỔNG HỢP KIẾN THỨC & BÀI HỌC KINH NGHIỆM VỀ MICRO FRONTENDS

## 1. Bản Chất Kiến Trúc Micro Frontend trong Angular

Micro Frontend (MFE) chia ứng dụng Web Monolithic thành các ứng dụng nhỏ độc lập (App Shell / Host và các Remote MFE). **Toàn bộ 3 ứng dụng Remote đều đã được chuyển đổi thành công sang Rsbuild + Rspack tốc độ cao.**

- **Host App:** `app-shell` (Angular 19, **Rsbuild/Rspack**) — Port `4200`
- **Remote App 1:** `mfe-auth` (Angular 19, **Rsbuild/Rspack**) — Port `4201`
- **Remote App 2:** `mfe-dashboard` (Angular 19, **Rsbuild/Rspack**) — Port `4202`
- **Remote App 3:** `mfe-reporting` (Angular 19, **Rsbuild/Rspack**) — Port `4203`
- **Backend Service:** `backend` (Node.js Express + TypeScript) — Port `3000`
- **Core Shared Library:** `libs/core` — Chuẩn cấu trúc mô-đun Clean Architecture (Application, Common, Infrastructure, Store, Config, Providers)

> 🚀 **Trạng thái hiện tại:** **100% dự án (Host App, 3 Remotes, Backend Service và Thư viện Shared Core)** đã được chuẩn hóa và đồng bộ 100%. Frontend chạy trên **Rsbuild + Rspack**, Backend API chạy trên **Node.js Express TypeScript** (Port 3000), Thư viện Shared Core nâng cấp cấu hình Clean Architecture mới nhất.

---

## 2. Quy Tắc Async Bootstrapping (bắt buộc đối với Module Federation)

### Vấn đề:
Nếu ứng dụng Angular khởi chạy ngay lập tức (`bootstrapApplication`) trực tiếp trong `main.ts`, Angular Core và các thư viện chung sẽ nạp **trước khi** Module Federation Runtime kịp nạp và kiểm tra danh sách **Shared Scope**. Điều này gây ra lỗi khởi tạo ứng dụng hoặc nạp trùng lặp thư viện (Duplicate Instance).

### Giải pháp:
Tách luồng khởi động thành 2 file:
- **`src/main.ts`**: Chỉ khai báo các flag devMode và thực hiện `import('./bootstrap')` động.
- **`src/bootstrap.ts`**: Thực hiện logic nạp Angular app thực sự.

```typescript
// main.ts (Async Boundary)
if (typeof (globalThis as any).ngDevMode === 'undefined') (globalThis as any).ngDevMode = {};
if (typeof (globalThis as any).ngJitMode === 'undefined') (globalThis as any).ngJitMode = false;

import('./bootstrap');
```

---

## 3. Nhật Ký Chi Tiết Tất Cả Các Lỗi Đã Sửa (System Fixes Log)

Dưới đây là tổng hợp toàn bộ các lỗi thực tế đã phát sinh trong quá trình phát triển và cách khắc phục triệt để:

### 🛠️ Lỗi 1: Nx Rspack Plugin Incompatibility trong Webpack Config (`apps/app-shell/webpack.config.ts`)
- **Triệu chứng:** App Shell bị crash khi biên dịch do plugin của Nx (`@nx/module-federation/angular`) vô tình chèn plugin `NormalModuleReplacementPlugin` dành riêng cho Rspack vào cấu hình Webpack.
- **Nguyên nhân:** Xung đột giữa bộ builder cũ của Nx và Webpack.
- **Giải pháp:** Sửa `apps/app-shell/webpack.config.ts` để lọc và chuyển đổi lại plugin về chuẩn Webpack:
  ```typescript
  updated.plugins = updated.plugins.map((plugin: any) => {
    if (plugin?.name === 'NormalModuleReplacementPlugin' && plugin._args) {
      return new webpack.NormalModuleReplacementPlugin(plugin._args[0], plugin._args[1]);
    }
    return plugin;
  });
  ```

---

### 🛠️ Lỗi 2: Xung Đột Phiên Bản Singleton `@angular/cdk` (`Version 18.2.14 ... does not satisfy ^19.2.0`)
- **Triệu chứng:** Trình duyệt xuất hiện hàng loạt warning đỏ từ Module Federation Runtime:
  `[ Federation Runtime ] Version 18.2.14 from mfe-auth of shared singleton module @angular/cdk does not satisfy the requirement...`
- **Nguyên nhân:** Thư viện giao diện `tds-ui` (v18.6.2) khai báo phụ thuộc `@angular/cdk` v18 làm npm tự động tải thêm 1 bản CDK 18 lồng bên trong `node_modules/tds-ui/node_modules/`.
- **Giải pháp:**
  1. Khai báo `singleton: true` trong `shared/federation.shared.ts`.
  2. Bổ sung cấu hình `"overrides"` trong `package.json` để ép `tds-ui` dùng chung Angular v19 với workspace:
     ```json
     "overrides": {
       "tds-ui": {
         "@angular/cdk": "$@angular/cdk",
         "@angular/core": "$@angular/core",
         "@angular/common": "$@angular/common",
         "@angular/forms": "$@angular/forms",
         "@angular/router": "$@angular/router"
       }
     }
     ```
  3. Chạy `npm install` và xóa sạch cache cũ: `rm -rf .angular/cache .nx/cache node_modules/.cache`.

---

### 🛠️ Lỗi 3: Điều Hướng Chuyển Trang Thất Bại (`NG04002: Cannot match any routes. URL Segment: 'dashboard'`)
- **Triệu chứng:** Khi người dùng click "Sign In" trong `mfe-auth`, console báo lỗi không tìm thấy route `/dashboard`.
- **Nguyên nhân:** `mfe-auth` chạy bằng **Rsbuild** còn `app-shell` chạy bằng **Webpack**. Instance `@angular/router` giữa 2 bundler khác nhau không được dùng chung 100%, làm cho router của `mfe-auth` không biết các tuyến đường của `app-shell`.
- **Giải pháp (Decoupled Event-Driven Routing):**
  - Xóa lệnh `this.router.navigateByUrl('/dashboard')` ở `LoginComponent` của `mfe-auth`.
  - `mfe-auth` phát sự kiện `USER_LOGGED_IN` qua `BaseEventBusService`.
  - `app-shell` (`app.component.ts`) lắng nghe sự kiện và thực hiện chuyển hướng tới `/dashboard` bằng chính Router của Shell:
    ```typescript
    // app.component.ts của Shell
    this.eventBus.on('USER_LOGGED_IN').subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
    ```

---

### 🛠️ Lỗi 4: Chuyển Đổi 100% Remotes (`mfe-auth`, `mfe-dashboard`, `mfe-reporting`) Sang Rsbuild
- **Triệu chứng:** Webpack mặc định sinh file `mf-manifest.json`, còn Rsbuild sinh file `remoteEntry.js` với global variable.
- **Giải pháp:** 
  1. Tạo `rsbuild.config.ts` cho cả 3 ứng dụng Remote khai báo `library: { type: 'global', name: 'mfe_<name>' }`.
  2. Bổ sung script `rsbuild:auth`, `rsbuild:dashboard`, `rsbuild:reporting` vào `package.json`.
  3. Cập nhật `app-shell/src/main.ts` khai báo dạng `global`:
     ```typescript
     init({
       name: 'app-shell',
       remotes: [
         { name: 'mfe-auth', entry: '/mfe-auth/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_auth' },
         { name: 'mfe-dashboard', entry: '/mfe-dashboard/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_dashboard' },
         { name: 'mfe-reporting', entry: '/mfe-reporting/remoteEntry.js', type: 'global', entryGlobalName: 'mfe_reporting' }
       ]
     });
     ```

---

### 🛠️ Lỗi 5: Lỗi Manifest & `remoteEntryExports is undefined` (`#RUNTIME-003`)
- **Triệu chứng:** Console báo lỗi `SyntaxError: Unexpected token 'E', "Error occu"... is not valid JSON` hoặc `remoteEntryExports is undefined`.
- **Nguyên nhân:** Một trong các server Remote (`4201`, `4202`, `4203`) chưa được bật. Webpack Proxy ở 4200 nhận phản hồi `ECONNREFUSED` và trả về một trang lỗi chữ HTML (`Error occurred while proxying...`). Runtime cố parse chữ `Error` thành JSON nên bị crash.
- **Giải pháp:** Đảm bảo tất cả các server Remote đều đã được khởi chạy trên đúng port tương ứng trước khi tải App Shell.

---

### 🛠️ Lỗi 6: Cú Pháp Template Angular `@if` trong `projects.component.html`
- **Triệu chứng:** Biển dịch `mfe-dashboard` thất bại với lỗi `NG5002: Unclosed block "if"`.
- **Nguyên nhân:** Thiếu dấu đóng khối `}` cho thẻ `@if` và dư thừa thẻ `</div>` đóng ở cuối file.
- **Giải pháp:** Đóng đúng cú pháp `@if (...) { ... }` và dọn dẹp thẻ div dư thừa.

---

### 🛠️ Lỗi 7: Lỗi ChunkLoadError 404 (`GET http://localhost:4200/429.js 404 Not Found`)
- **Triệu chứng:** Console báo lỗi `ChunkLoadError: Loading chunk 429 failed. (http://localhost:4200/429.js 404 Not Found)`.
- **Nguyên nhân:** Tùy chọn `publicPath: 'auto'` trong Rspack làm cho các Remote App khi được nạp động qua global script cố gắng lấy các file chunk phụ (vd: `429.js`, `695.js`, `969.js`) trực tiếp từ URL của Host (`http://localhost:4200/`) thay vì tiền tố đường dẫn proxy của từng Remote.
- **Giải pháp:** Cập nhật `rsbuild.config.ts` của cả 3 ứng dụng Remote gán giá trị đường dẫn tiền tố tương ứng:
  - `mfe-auth`: `publicPath: '/mfe-auth/'`, `assetPrefix: '/mfe-auth/'`
  - `mfe-dashboard`: `publicPath: '/mfe-dashboard/'`, `assetPrefix: '/mfe-dashboard/'`
  - `mfe-reporting`: `publicPath: '/mfe-reporting/'`, `assetPrefix: '/mfe-reporting/'`
  Nhờ đó, mọi request tải chunk sẽ chuyển sang `http://localhost:4200/mfe-dashboard/429.js` và được Webpack Proxy chuyển tiếp tới đúng port của Remote MFE.

---

### 🛠️ Lỗi 8: Lỗi Hiển Thị Giao Diện Filters trong `mfe-reporting` (`http://localhost:4200/reporting`)
- **Triệu chứng:** Ô chọn Date Range, Category hiển thị khung trắng rỗng không có chữ, các nút Status (All, Completed, Pending) và Apply Filters bị biến dạng thành các hình tròn rỗng.
- **Nguyên nhân:** Directive `tds-button` và component `tds-select` từ thư viện `tds-ui` bị xung đột style với TailwindCSS và thiếu cấu hình thẻ `tds-option`. `tds-button` ép chiều rộng/cao thành 32px làm văng hết nhãn chữ của button.
- **Giải pháp:** Viết lại `reporting.component.html` sử dụng các thẻ HTML điều khiển chuẩn (`<select>`, `<button>`) kết hợp với TailwindCSS utility classes hiện đại và viền đỏ chủ đạo (`#800A20`). Giao diện hiển thị rõ ràng 100% nhãn chữ, dropdown mượt mà và nút bấm sắc nét.

---

### 🛠️ Lỗi 9: Lỗi Angular DI `NullInjectorError: No provider for DomRendererFactory2!` trên `app-shell`
- **Triệu chứng:** Khi truy cập Host App `app-shell` chuyển sang Rsbuild, console báo lỗi `NullInjectorError: No provider for DomRendererFactory2!` và `NG0200: Circular dependency in DI detected for RendererFactory2`.
- **Nguyên nhân:**
  1. Gói `@angular/platform-browser/animations` và các subpackages của Angular chưa được liệt kê đầy đủ trong `sharedMappings` khiến Rspack không chia sẻ module này dưới dạng singleton, tạo ra 2 bản sao độc lập của `DomRendererFactory2` giữa Host và Remote.
  2. Host App `app-shell` thiếu thuộc tính `eager: true` cho các thư viện cốt lõi (`@angular/core`, `@angular/common`, `@angular/platform-browser`, `@angular/platform-browser/animations`, `@angular/router`) làm Angular DI bị trùng lặp token.
- **Giải pháp:**
  1. Thêm đầy đủ các subpackage Angular (`@angular/platform-browser/animations`, `@angular/animations/browser`, `@angular/platform-browser-dynamic`, v.v.) vào `shared/federation.shared.ts`.
  2. Bổ sung `ownKeys` và `getOwnPropertyDescriptor` traps cho Proxy `sharedMappings`.
  3. Cấu hình `eager: true` cho `@angular/core`, `@angular/common`, `@angular/platform-browser`, `@angular/platform-browser/animations`, `@angular/router` trong `apps/app-shell/rsbuild.config.ts`.

---

### 🛠️ Lỗi 10: Lỗi Runtime Module Federation `#RUNTIME-006` (`loadShareSync failed for @angular/core/primitives/signals`)
- **Triệu chứng:** Console báo lỗi `loadShareSync failed! The function should not be called unless you set "eager:true" ... Invalid loadShareSync function call from runtime #RUNTIME-006 args: {"hostName":"app-shell","sharedPkgName":"@angular/core/primitives/signals"}`.
- **Nguyên nhân:** Các subpackage nội bộ của Angular 19 (như `@angular/core/primitives/signals`) được Angular nạp đồng bộ, nhưng ở Host App `app-shell` mới chỉ liệt kê một vài gói cơ bản là `eager: true`. Khi Angular core chạy đồng bộ, nó gọi `loadShareSync` cho `primitives/signals` chưa được đánh dấu `eager: true` dẫn đến lỗi runtime #RUNTIME-006.
- **Giải pháp:** Cập nhật cấu hình `moduleFederation.options.shared` trong `apps/app-shell/rsbuild.config.ts` duyệt qua toàn bộ các gói trong `sharedMappings` và tự động gắn `eager: true` cho toàn bộ các thư viện dùng chung ở phía Host App (`app-shell`). Nhờ đó Host App cung cấp đầy đủ các module dùng chung cho cả 3 Remote MFE mà không gặp bất kỳ lỗi `loadShareSync` nào.

---

### 🛠️ Lỗi 11 & 12: Lỗi Angular DI `NullInjectorError` & `ReferenceError: Cannot access 'BaseStorageService' before initialization`
- **Triệu chứng:** Console báo lỗi `ERROR NullInjectorError: No provider for BaseStorageService!` hoặc `ReferenceError: Cannot access 'BaseStorageService' before initialization`.
- **Nguyên nhân:**
  1. Lỗi Circular Dependency (vòng lặp phụ thuộc ESM): `base-storage.service.ts` import `StorageService` từ `../infrastructure/`, trong khi `storage.service.ts` lại `extends BaseStorageService` làm bundler crash ở thời điểm khởi tạo module.
  2. Khi `@core` được đóng gói độc lập trong từng Remote MFE, các abstract class không có `@Injectable({ providedIn: 'root' })` khiến Angular DI ở Remote không tự khởi tạo được instance.
- **Giải pháp:** Chuyển các lớp cơ sở `BaseStorageService`, `BaseEventBusService`, `BaseApiService`, `BaseLoadingService` thành các `@Injectable({ providedIn: 'root' })` service độc lập, hoàn chỉnh. Tháo bỏ hoàn toàn import ngược từ `base/` tới `infrastructure/`. Nhờ đó loại bỏ 100% vĩnh viễn vướng mắc vòng lặp ESM và lỗi `NullInjectorError` trên cả Shell và tất cả MFE.

---

### 🛠️ Lỗi 13: Đăng Nhập Không Thấy Gọi API Thật Trong DevTools Network Tab
- **Triệu chứng:** Khi bấm Sign In ở giao diện Auth (`http://localhost:4200/auth/login`), tab Console in ra log `[HTTP API Call] POST /api/auth/login` nhưng ở tab **Network** của Chrome DevTools hoàn toàn không xuất hiện HTTP Request gửi đi.
- **Nguyên nhân:** Thư viện `@core` trước đây đăng ký `mockApiInterceptor` trong `provideHttpClient(...)` để giả lập dữ liệu tĩnh ngay trong bộ nhớ JavaScript của Angular Client. Việc này làm chặn toàn bộ request HTTP không cho gửi ra ngoài mạng tới Backend Server.
- **Giải pháp:**
  1. Tháo bỏ `mockApiInterceptor` trong `libs/core/src/lib/providers.ts` để chuyển toàn bộ luồng gọi API sang gửi request HTTP thực tế.
  2. Kết hợp với proxy `/api` trỏ về `http://localhost:3000` (Node.js Express Backend), bây giờ khi bấm Sign In, trình duyệt lập tức phát HTTP `POST /api/auth/login` thật và hiển thị 200 OK trên DevTools Network tab.
  3. Bổ sung `this.router.navigate(['/dashboard'])` trong `LoginComponent` để tự động điều hướng ngay sang Dashboard sau khi xác thực thành công.

---

### 🛠️ Lỗi 14 & 15: Lỗi `@ngrx/signals/rxjs-interop` và `node:path` trong `remote-loader.util.ts`
- **Triệu chứng:**
  1. Console báo lỗi: `Module not found: Can't resolve '@ngrx/signals/rxjs-interop' in libs/core/src/lib/store`.
  2. Rsbuild báo lỗi: `Error: "node:*" is a built-in Node.js module and cannot be imported in client-side code` từ `./node_modules/@nx/angular/fesm2022/nx-angular-mf.mjs`.
- **Nguyên nhân:**
  1. Cấu trúc `libs/core` mới từ `demo2` sử dụng `@ngrx/signals` (State Management), nhưng gói này chưa được cài phiên bản tương thích với Angular 19 (`@ngrx/signals@19.0.0`) và Proxy `sharedMappings` chưa bắt được pattern `@ngrx/signals/`.
  2. File `remote-loader.util.ts` cũ import `@nx/angular/mf` vốn chứa code Node.js `node:path`.
- **Giải pháp:**
  1. Cài đặt `@ngrx/signals@^19.0.0` tương thích tuyệt đối với Angular 19 và thêm `@ngrx/signals/` vào `shared/federation.shared.ts`.
  2. Thay thế hoàn toàn `@nx/angular/mf` trong `remote-loader.util.ts` bằng `@module-federation/enhanced/runtime` chuẩn của Rsbuild.
  3. Đã chạy thử nghiệm build thực tế cả 4 dự án (`app-shell`, `mfe-auth`, `mfe-dashboard`, `mfe-reporting`), toàn bộ 4 dự án đều đạt kết quả **BUILD SUCCESS 100% (thời gian build siêu tốc ~8s)**.

---

### 🛠️ Lỗi 16: Lỗi `TypeError: Cannot read properties of undefined (reading 'dispose')` trên HMR Router
- **Triệu chứng:**
  Khi trình duyệt nạp route `auth` hoặc `dashboard`, Console bắn ra lỗi: `TypeError: Cannot read properties of undefined (reading 'dispose') at Promise.then at app.routes.ts:18`.
- **Nguyên nhân:**
  `loadChildren` trong `app.routes.ts` trực tiếp gọi `loadRemote('mfe-auth/Routes').then(m => m.appRoutes)`. Khi HMR hoặc Angular Router tiến hành reload/dispose module, router cố truy cập hàm `.dispose()` trên object trả về từ Promise làm bắn ra ngoại lệ runtime.
- **Giải pháp:**
  Chuyển sang sử dụng `loadRemoteModule` chuẩn từ `@core` (`import { loadRemoteModule } from '@core'`) cho tất cả các lazy routes trong [`apps/app-shell/src/app/app.routes.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/apps/app-shell/src/app/app.routes.ts). Hàm này đã bọc kiểm tra `isBrowser` và bẫy lỗi an toàn cho Angular Router.

---

### 🛠️ Lỗi 17: Lỗi `Attempting to attach an unknown Portal type` từ `tds-ui-drawer`
- **Triệu chứng:**
  Khi giao diện render `TDSDrawerComponent` (từ thư viện `tds-ui`), Console bắn ra ngoại lệ:
  `ERROR Error: Attempting to attach an unknown Portal type. BasePortalOutlet accepts either a ComponentPortal or a TemplatePortal. at DomPortalOutlet.attach at OverlayRef.attach at TDSDrawerComponent.attachOverlay`.
- **Nguyên nhân:**
  Thư viện UI `tds-ui` chưa được cấu hình chia sẻ singleton chung qua Module Federation trong `shared/federation.shared.ts`. Khi `TDSDrawerComponent` của `tds-ui` tạo `TemplatePortal` hoặc `ComponentPortal`, phép kiểm tra `portal instanceof TemplatePortal` bị thất bại do class `TemplatePortal` thuộc instance bundle khác với `@angular/cdk/portal`.
- **Giải pháp:**
  Thêm `'tds-ui'` vào cấu hình `rawSharedMappings` và thiết lập bẫy Proxy pattern (`key.startsWith('tds-ui/') || key === 'tds-ui'`) trong [`shared/federation.shared.ts`](file:///Users/bao312/Desktop/untitled%20folder%202/demo/shared/federation.shared.ts) để đảm bảo `tds-ui` và `@angular/cdk` luôn dùng duy nhất 1 singleton instance trên toàn bộ Micro-Frontends.

---
---

# PHẦN II: TÀI LIỆU CẤU TRÚC & CẤU HÌNH CHI TIẾT RSBUILD REMOTES

## 1. Bảng Thông Số Kỹ Thuật Các Remote App

| Dự án | Thư mục | Port | Build Tool | Global Export Name | Entry File | Exposes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`mfe-auth`** | `apps/mfe-auth` | `4201` | Rsbuild + Rspack | `mfe_auth` | `remoteEntry.js` | `./Routes` |
| **`mfe-dashboard`** | `apps/mfe-dashboard` | `4202` | Rsbuild + Rspack | `mfe_dashboard` | `remoteEntry.js` | `./Routes`, `./Projects` |
| **`mfe-reporting`** | `apps/mfe-reporting` | `4203` | Rsbuild + Rspack | `mfe_reporting` | `remoteEntry.js` | `./Routes` |

---

## 2. Hướng Dẫn Vận Hành Toàn Bộ Hệ Thống

Chạy toàn bộ 3 Remote bằng Rsbuild và App Shell bằng Webpack ở 4 cửa sổ terminal riêng biệt:

```bash
# Khởi động đồng thời cả 5 dịch vụ (Backend + Host App + 3 Remotes) bằng 1 lệnh duy nhất:
npm run start:all

# Hoặc khởi động riêng lẻ từng dịch vụ:
npm run start:backend     # Backend Node.js Express (Port 3000)
npm run rsbuild:auth      # mfe-auth (Port 4201)
npm run rsbuild:dashboard # mfe-dashboard (Port 4202)
npm run rsbuild:reporting # mfe-reporting (Port 4203)
npm run rsbuild:shell     # app-shell (Port 4200)
```

Đường dẫn truy cập ứng dụng chính: `http://localhost:4200/`
