# Tóm tắt & Hướng dẫn triển khai Micro Frontends với Angular, Native Federation & Rsbuild/Rspack

Tài liệu tổng hợp các phương pháp thiết lập và triển khai kiến trúc Micro Frontends trong Angular: từ **Native Federation** dựa trên tiêu chuẩn Web (ESM, Import Maps) đến việc kết hợp **Nx, Rspack, Rsbuild** với gói Module Federation thế hệ mới (`@module-federation/enhanced`).

---

## Phần I: Kiến trúc Native Federation (Web Standards)

### I. Tổng quan Kiến trúc
- **Host (App Shell):** Ứng dụng trung tâm đóng vai trò là khung giao diện chính, thực hiện điều hướng (Routing), quản lý phiên đăng nhập và tải động các Remote Micro Frontends.
- **Remote:** Các ứng dụng micro-frontend độc lập, phát triển độc lập và Expose (xuất) ra các Component / Module / Route cho Host sử dụng.
- **Shared Dependencies:** Khai báo các thư viện chung (Angular Core, Router, RxJS, UI Library...) dưới dạng Singleton để chỉ tải một lần duy nhất ở trình duyệt.

### II. Các bước triển khai Native Federation
1. **Cài đặt gói:** `ng add @angular-architects/native-federation` cho Host (dạng `dynamic-host`) và Remote (dạng `remote`).
2. **Cấu hình `federation.config.js`:** Định nghĩa `name`, `exposes` (đối với Remote) và `shared` (`shareAll` với `singleton: true`).
3. **Khai báo `federation.manifest.json`:** Khai báo URL `remoteEntry.json` của các Remote tại thời điểm runtime.
4. **Tích hợp Routing:** Sử dụng `loadRemoteModule` từ `@angular-architects/native-federation` trong `app.routes.ts`.

---

## Phần II: Kiến trúc Nx Workspace kết hợp với Rspack, Rsbuild & Module Federation

Dựa theo bài viết *"Nx and Angular with Rspack and Module Federation"* của tác giả Manfred Steyer, việc ứng dụng **Rspack** (Rust-based bundler siêu nhanh) và **Rsbuild** mang lại tốc độ build vượt trội cho dự án Angular Monorepo trong Nx.

### I. Tổng quan công nghệ
- **Rspack & Rsbuild:** Trình đóng gói hiệu năng cao viết bằng Rust, tương thích với Webpack API nhưng cho tốc độ build nhanh gấp nhiều lần.
- **`@ng-rsbuild/plugin-nx`:** Plugin mở rộng cho Nx Workspace giúp tạo và đóng gói ứng dụng Angular bằng Rsbuild, tích hợp sẵn Module Federation và hỗ trợ SSR.
- **Module Federation 2 (`@module-federation/enhanced`):** Thư viện runtimeModule Federation thế hệ mới hoạt động độc lập trên nhiều bundler (Webpack, Rspack, Vite).

---

### II. Hướng dẫn các bước thiết lập trong Nx Workspace

#### Bước 1: Khởi tạo Nx Workspace & Cài đặt Plugin

```bash
# 1. Cài đặt plugin Rsbuild cho Angular trong Nx
npx nx add @ng-rsbuild/plugin-nx

# 2. Tạo ứng dụng Host (shell) và Remote (mfe1)
npx nx g @ng-rsbuild/plugin-nx:application shell
npx nx g @ng-rsbuild/plugin-nx:application mfe1

# 3. Cài đặt Module Federation Enhanced Runtime
npm i @module-federation/enhanced
```

---

#### Bước 2: Chuyển sang Async Bootstrapping (bắt buộc)

Để Module Federation kịp thời khởi tạo và nạp các shared dependencies trước khi ứng dụng Angular bootstrap:

Chuyển logic nạp ứng dụng trong `main.ts` sang `bootstrap.ts`, sau đó tại `main.ts` gọi động:

```typescript
// src/main.ts
import('./bootstrap');
```

---

#### Bước 3: Cấu hình `rsbuild.config.ts` cho Remote App (`mfe1`)

```typescript
// apps/mfe1/rsbuild.config.ts
import { createConfig } from '@ng-rsbuild/plugin-angular';
import { shareAll } from '../mf.tools';

export default createConfig({
  browser: './src/main.ts',
}, {
  server: {
    port: 4201
  },
  tools: {
    rspack: {
      output: {
        uniqueName: 'mfe1',
        publicPath: 'auto',
      },
    },
  },  
  moduleFederation: {
    options: {
      name: 'mfe1',
      filename: 'remoteEntry.js',
      exposes: {
        './Component': './src/app/app.component.ts'
      },
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
        })
      }
    }
  }
});
```

---

#### Bước 4: Cấu hình Host App (`shell`)

##### 4.1. Cấu hình `rsbuild.config.ts`
```typescript
// apps/shell/rsbuild.config.ts
import { createConfig } from '@ng-rsbuild/plugin-angular';
import { shareAll } from '../mf.tools';

export default createConfig({
  browser: './src/main.ts',
}, {
  moduleFederation: {
    options: {
      name: 'shell',
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
        })
      }
    }
  }
});
```

##### 4.2. Khởi tạo Module Federation Runtime trong `shell/src/main.ts`
```typescript
import { init } from '@module-federation/enhanced/runtime';

init({
  name: 'shell',
  remotes: [
    {
      name: 'mfe1',
      entry: 'http://localhost:4201/remoteEntry.js',
    }
  ],
});

import('./bootstrap');
```

##### 4.3. Nạp Remote Component trong Router (`shell/src/app/app.routes.ts`)
```typescript
import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { Type } from '@angular/core';

export const appRoutes: Route[] = [
  {
    path: 'mfe1',
    loadComponent: () => loadRemote('mfe1/Component') as Promise<Type<unknown>>
  }
];
```

---

### III. Quy tắc quan trọng khi làm việc với Rspack & Angular

1. **Ghim cứng phiên bản Angular (Pin Versions):**
   - Trong `package.json`, cần bỏ các ký tự phiên bản mềm như `^` hoặc `~` ở các gói `@angular/*`. Nguyên nhân do mã Angular biên dịch trực tiếp truy cập vào các Private API của framework nên bắt buộc phải đồng bộ chính xác phiên bản giữa Host và Remote.
2. **`publicPath: 'auto'`:**
   - Đảm bảo các file bundle của Remote được Host tải đúng URL nguồn tại thời điểm runtime.
3. **Shared Singleton Rules:**
   - Thiết lập `singleton: true` và `strictVersion: true` để tránh tình trạng nạp trùng lặp các thư viện core (`@angular/core`, `rxjs`) gây lỗi trạng thái ứng dụng.
