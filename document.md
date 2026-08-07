# 📚 TÀI LIỆU KỸ THUẬT NỀN TẢNG MICRO-FRONTEND (TECHNICAL SYSTEM DOCUMENTATION)

### 🏢 Hệ thống: TMT Enterprise Micro-Frontend Portal
- **Phiên bản Architecture:** 1.0.0  
- **Framework:** Angular 18 (Standalone Components, Signals, SSR Support)  
- **Monorepo:** Nx Workspace 23.x  
- **Design System:** Telenor Design System (`tds-ui`) & Tailwind CSS  

---

## CHƯƠNG 1: TỔNG QUAN KIẾN TRÚC VÀ MÔ HÌNH HỆ THỐNG (SYSTEM ARCHITECTURE)

### 1.1. Mô hình Micro-Frontend (MFE) với Webpack Module Federation
Hệ thống được thiết kế theo kiến trúc **Micro-Frontend** độc lập, sử dụng **Webpack Module Federation** (`@module-federation/enhanced`) trong không gian làm việc **Nx Monorepo**:

- **App Shell (Host System - Port 4200):** 
  - Đóng vai trò là Container trung tâm điều phối ứng dụng.
  - Chịu trách nhiệm render Layout chính (Sidebar điều hướng TMT, Header), quản lý Auth Guard, Routing toàn cục, SSR Hydration.
  - Nạp động (Dynamic Lazy Loading) các remote module từ các Micro-Frontend khác thông qua `loadRemoteModule`.
- **Remote Micro-Frontends (Port 4201, 4202, 4203):** 
  - `mfe-auth`: Độc lập xử lý quy trình Xác thực (Login, Forgot Password, Token storage).
  - `mfe-dashboard`: Quản lý giao diện Bảng điều khiển (Dashboard KPI & Kanban Board Project Management).
  - `mfe-reporting`: Xử lý phân tích dữ liệu, báo cáo doanh thu & xuất file (Excel/PDF).
- **Shared Layer (`libs/core`, `libs/ui`, `shared/`):** Nơi chứa các singleton logic, service, interceptor, global styles và Module Federation contracts.

### 1.2. Sơ đồ Tương tác Kiến trúc (Architecture Interaction Diagram)

```text
                                 +---------------------------------+
                                 |        App Shell (Host)         |
                                 |          (Port 4200)            |
                                 +---------------------------------+
                                       |            |            |
                     +-----------------+            |            +-----------------+
                     | (Lazy Load)                  | (Lazy Load)                  | (Lazy Load)
                     v                              v                              v
    +---------------------------------+  +--------------------+  +---------------------------------+
    |            mfe-auth             |  |   mfe-dashboard    |  |          mfe-reporting          |
    |           (Port 4201)           |  |    (Port 4202)     |  |           (Port 4203)           |
    | - Login                         |  | - KPI Dashboard    |  | - Analytics & Stats             |
    | - Forgot Password               |  | - Kanban Board     |  | - Export PDF/Excel              |
    +---------------------------------+  +--------------------+  +---------------------------------+
                     \                              |                              /
                      \                             |                             /
                       +----------------------------+----------------------------+
                                                    |
                                                    v
                                 +---------------------------------+
                                 |         Shared Layer            |
                                 | - libs/core (Auth, Interceptors)|
                                 | - libs/ui (Global SCSS, TDS)    |
                                 | - shared/federation.shared.ts   |
                                 +---------------------------------+
```

---

## CHƯƠNG 2: CHI TIẾT CÁC MODULE ỨNG DỤNG (APPLICATIONS DETAIL)

### 2.1. App Shell (`apps/app-shell`)
- **Vai trò:** Host Container.
- **Thành phần chính:**
  - `app.routes.ts`: Định nghĩa Routing root với AuthGuard. Sử dụng `loadRemoteModule` từ `@nx/angular/mf` để nạp động bundle của từng MFE theo nhu cầu (On-Demand).
  - `ForbiddenComponent` (`page-403`): Trang lỗi 403 khi người dùng không đủ quyền truy cập.
  - `NotFoundComponent` (`page-404`): Trang lỗi 404 với mascot linh vật TDS khi người dùng truy cập URL không khả dụng.
  - `authGuard`: Service Guard kiểm tra `localStorage` JWT token/user trước khi cấp quyền truy cập các route protected (`/dashboard`, `/projects`, `/reporting`).

### 2.2. MFE Auth (`apps/mfe-auth`)
- **Vai trò:** Quản lý luồng xác thực người dùng.
- **Thành phần chính:**
  - `LoginComponent`: Form đăng nhập sử dụng TDS Form Controls & Button. Hỗ trợ xác thực chọn vai trò (`Administrator` / `User`). Lưu `mfe_jwt_token` và `mfe_mock_user` vào local storage.
  - `ForgotPasswordComponent`: Quy trình lấy lại mật khẩu.

### 2.3. MFE Dashboard & Projects (`apps/mfe-dashboard`)
- **Vai trò:** Trung tâm quản lý công việc và báo cáo KPI.
- **Thành phần chính:**
  - `ProjectsComponent` (`/projects`): Giao diện Kanban Board quản lý dự án doanh nghiệp:
    - **4 Cột trạng thái:** `To Do`, `In Progress`, `In Review`, `Completed`.
    - **Project Card:** Hiển thị Badge độ ưu tiên (`HIGH`, `MEDIUM`, `LOW`), Progress bar tiến độ %, danh sách subtasks/comments, avatar thành viên.
    - **Chức năng:** Lọc theo trạng thái tab (`All`, `Active`, `Completed`, `On Hold`), Tìm kiếm theo tên dự án, Sắp xếp (Sort), Thêm mới dự án qua Modal.
    - **TDS Notification Integration:** Tích hợp `TDSNotificationService` hiển thị Toast phản hồi tương tác chuẩn màu sắc và hiệu ứng.

### 2.4. MFE Reporting (`apps/mfe-reporting`)
- **Vai trò:** Phân tích dữ liệu & Báo cáo.
- **Thành phần chính:** Bảng thống kê hiệu suất dự án, công cụ xuất báo cáo dữ liệu định dạng Excel/PDF.

---

## CHƯƠNG 3: CHI TIẾT THƯ VIỆN DÙNG CHUNG (SHARED LIBRARIES & CORE)

### 3.1. Thư viện Logic Core (`libs/core`)
- `MockApiInterceptor`: Interceptor giả lập REST API cho toàn bộ hệ thống (dự án, auth, reporting) mà không phụ thuộc vào Backend thật trong quá trình phát triển & demo.
- `AuthorizationTokenInterceptor`: Tự động gắn mác `Authorization: Bearer <token>` vào tất cả các HTTP Request gửi đi.
- `StorageService`: Utility tương tác an toàn với LocalStorage / SessionStorage (hỗ trợ cả môi trường Client-side & SSR).
- `EventBusService`: Cơ chế Pub/Sub truyền tin sự kiện giữa các Micro-Frontend khác nhau mà không cần phụ thuộc trực tiếp (Decoupled Architecture).

### 3.2. Thư viện UI & Style (`libs/ui`)
- **Global Styles (`global.scss`):** 
  - Nằm tại `libs/ui/src/lib/styles/global.scss`, chứa toàn bộ CSS override cho hệ thống thiết kế **Telenor Design System (`tds-ui`)**.
  - **Thiết kế Toast Notification (`tds-notification`):**
    - Thiết lập độ rộng chuẩn compact **340px**.
    - Phân loại màu sắc viền trái và icon theo trạng thái:
      - 🟢 **Success (Thành công):** Border `#10b981`, badge xanh lá kèm dấu `✓`.
      - 🔴 **Error (Thất bại/Lỗi):** Border `#ef4444`, badge đỏ kèm dấu `✕`.
      - 🔵 **Info (Thông tin):** Border `#3b82f6`, badge xanh dương kèm chữ `i`.
      - 🟡 **Warning (Cảnh báo):** Border `#f59e0b`, badge vàng cam kèm dấu `!`.
    - Nút đóng (`×`): Kích thước 24x24px, cố định góc trên phải (`top: 10px`, `right: 10px`), có hiệu ứng hover đổi màu nền và fallback icon tự động hiển thị khi thiếu font icon.

---

## CHƯƠNG 4: CẤU HÌNH MODULE FEDERATION & QUẢN LÝ SINGLETON DEPENDENCIES

Để tránh tình trạng nạp trùng lặp các thư viện Angular Core hay RxJS giữa App Shell và các MFE (gây ra lỗi multiple instances của Injector hoặc ChangeDetectorRef), hệ thống sử dụng cấu hình Proxy tại `shared/federation.shared.ts`:

- Tất cả gói `@angular/*`, `rxjs`, `@angular/cdk`, `tds-ui`, `@core`, `@ui` được cấu hình là **Singleton**:
  ```typescript
  export const sharedMappings = {
    '@angular/core': { singleton: true, strictVersion: false },
    'rxjs': { singleton: true, strictVersion: false },
    'tds-ui': { singleton: true, strictVersion: false },
    '@core': { singleton: true, strictVersion: false },
    '@ui': { singleton: true, strictVersion: false }
  };
  ```

---

## CHƯƠNG 5: HƯỚNG DẪN VẬN HÀNH & PHÁT TRIỂN (DEVELOPMENT WORKFLOW)

### 5.1. Lệnh Khởi chạy
- **Chạy toàn bộ hệ thống:**
  ```bash
  npm start
  ```
- **Chạy riêng ứng dụng cụ thể:**
  ```bash
  npm run start:shell      # Host at http://localhost:4200
  npm run start:auth       # MFE at http://localhost:4201
  npm run start:dashboard  # MFE at http://localhost:4202
  npm run start:reporting  # MFE at http://localhost:4203
  ```

### 5.2. Lệnh Biên dịch & Kiểm tra
```bash
npm run build         # Build production cho các app bị thay đổi
npm run build:lib     # Build các thư viện libs/core và libs/ui
npm run test          # Chạy Unit test với Jest
```
