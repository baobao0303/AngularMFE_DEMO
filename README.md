# 🚀 MFE Enterprise Angular Workspace - TMT Project Management Portal

Dự án Monorepo kiến trúc **Micro-Frontend (MFE)** mô phỏng hệ thống **Cổng Quản lý Dự án Doanh nghiệp (TMT Project Management Portal)**. Hệ thống được phát triển dựa trên **Nx Workspace**, **Angular 18**, **Webpack Module Federation** và hệ thống giao diện chuẩn **Telenor Design System (`tds-ui`)** kết hợp **Tailwind CSS**.

---

## 🎯 Mục đích & Ứng dụng Demo (Demo Features & Business Purpose)

Dự án demo một hệ thống quản lý công việc/dự án doanh nghiệp hoàn chỉnh được chia nhỏ thành các ứng dụng Micro-Frontend hoạt động độc lập và ghép nối mượt mà tại App Shell.

### 1. 🛡 App Shell (Host Application - `http://localhost:4200`)
- **Khung giao diện chính (Main Shell Layout)**: Thanh Sidebar điều hướng bên trái (Logo TMT, Navigation links, Profile user hiện tại), Header và khu vực hiển thị nội dung động.
- **Routing & Module Federation Host**: Tự động nạp động các Micro-Frontend (`mfe-auth`, `mfe-dashboard`, `mfe-reporting`) thông qua `loadRemoteModule`.
- **Bảo mật & Điều hướng (Auth Guard)**: Kiểm tra trạng thái đăng nhập, tự động chuyển hướng về trang Login nếu chưa có token.
- **Trang lỗi chuẩn TDS**:
  - 🚫 **Trang 403 (Forbidden)**: Hiển thị khi người dùng không có quyền truy cập.
  - 🔍 **Trang 404 (Not Found)**: Xử lý các đường dẫn không hợp lệ với Mascot linh vật TDS và nút quay về Dashboard.

### 2. 🔐 MFE Auth (`http://localhost:4201`)
- **Đăng nhập (`/auth/login`)**: Giao diện đăng nhập hiện đại tích hợp TDS Components, hỗ trợ xác thực mock user (`Administrator` / `User`), lưu trữ JWT Token và Session vào `localStorage`.
- **Quên mật khẩu (`/auth/forgot-password`)**: Form hỗ trợ khôi phục mật khẩu.

### 3. 📋 MFE Dashboard & Projects (`http://localhost:4202`)
- **Tổng quan Dashboard (`/dashboard`)**: Hiển thị các chỉ số KPI tổng quan, thống kê dự án và tiến độ làm việc.
- **Quản lý Dự án Kanban Board (`/projects`)**:
  - **Bảng Kanban trực quan**: Phân loại dự án theo 4 trạng thái (`To Do`, `In Progress`, `In Review`, `Completed`).
  - **Thẻ thông tin dự án (Project Cards)**: Hiển thị độ ưu tiên (`HIGH`, `MEDIUM`, `LOW`), thanh phần trăm tiến độ (Progress bar), số lượng subtasks/comments, và danh sách ảnh đại diện thành viên tham gia.
  - **Bộ lọc & Tìm kiếm**: Lọc dự án theo tab (`All`, `Active`, `Completed`, `On Hold`), tìm kiếm theo tên dự án và sắp xếp (Sort).
  - **Tạo dự án mới**: Thêm dự án vào hệ thống qua Modal form.
  - **Hệ thống Notification Toast (`TDSNotificationService`)**: Hiển thị thông báo phản hồi thao tác gọn gàng (340px) với màu sắc chuẩn trạng thái (Thành công: Xanh lá, Lỗi: Đỏ) và nút đóng có fallback icon.

### 4. 📊 MFE Reporting (`http://localhost:4203`)
- **Báo cáo & Thống kê (`/reporting`)**: Cung cấp giao diện xem báo cáo hiệu suất công việc, đồ thị thống kê và hỗ trợ xuất dữ liệu (Excel/PDF).

---

## 📐 Kiến trúc Thư mục (Architecture Overview)

```text
demo/
├── apps/
│   ├── app-shell/       # App Container chính (Host), quản lý Navigation, Header, Sidebar, AuthGuard & Error Pages
│   ├── mfe-auth/        # Micro-frontend quản lý Đăng nhập & Xác thực (Port 4201)
│   ├── mfe-dashboard/   # Micro-frontend Dashboard & Quản lý Dự án Kanban (Port 4202)
│   └── mfe-reporting/   # Micro-frontend Báo cáo & Thống kê dữ liệu (Port 4203)
├── libs/
│   ├── core/            # Thư viện core logic dùng chung (Services, Auth State, Guards, Interceptors)
│   └── ui/              # Thư viện UI dùng chung (Global Styles, TDS Overrides, Custom Components)
└── shared/              # Cấu hình Module Federation dùng chung
```

---

## 🛠 Công nghệ Sử dụng (Tech Stack)

- **Framework**: Angular 18 (Standalone Components, Signals, Router, SSR Ready)
- **Monorepo Architecture**: Nx 23.x
- **Micro-Frontend Engine**: Webpack Module Federation (`@module-federation/enhanced`)
- **Design System**: `tds-ui` (Telenor Design System)
- **Styling**: Tailwind CSS & SCSS Custom Overrides
- **Unit Test & Quality**: Jest, ESLint

---

## 💻 Yêu cầu Môi trường (Prerequisites)

- **Node.js**: `>= 18.x` (Khuyên dùng Node `20.x`)
- **Package Manager**: `npm` hoặc `pnpm`
- Đảm bảo máy tính có kết nối mạng để tải package `tds-ui` từ registry nội bộ.

---

## 🚀 Hướng dẫn Khởi chạy (Getting Started)

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Khởi chạy toàn bộ hệ thống (Host + Tất cả MFE)

```bash
npm start
```

Sau khi ứng dụng khởi chạy thành công:
- 🌐 **App Shell (Host System)**: [http://localhost:4200](http://localhost:4200)
- 🔐 **MFE Auth**: [http://localhost:4201](http://localhost:4201)
- 📋 **MFE Dashboard**: [http://localhost:4202](http://localhost:4202)
- 📊 **MFE Reporting**: [http://localhost:4203](http://localhost:4203)

### 3. Khởi chạy từng Micro-Frontend độc lập

```bash
# Khởi chạy duy nhất App Shell
npm run start:shell

# Khởi chạy MFE Auth
npm run start:auth

# Khởi chạy MFE Dashboard
npm run start:dashboard

# Khởi chạy MFE Reporting
npm run start:reporting
```

---

## 📦 Biên dịch Sản phẩm (Build & Production)

```bash
# Build tất cả ứng dụng trong workspace
npm run build

# Build riêng thư viện libs dùng chung
npm run build:lib
```

---

## 🎨 Chuẩn hóa Giao diện Toast Notification (`tds-ui`)

Hệ thống thông báo Toast được tùy chỉnh toàn cục tại `libs/ui/src/lib/styles/global.scss`:
- **Độ rộng chuẩn**: Fixed `340px` gọn gàng, phù hợp giao diện Dashboard.
- **Màu sắc nhận diện trạng thái**:
  - 🟢 **Success**: Viền trái xanh lá `#10b981`, badge checkmark `✓`.
  - 🔴 **Error / Failed**: Viền trái đỏ `#ef4444`, badge cross `✕`.
  - 🔵 **Info**: Viền trái xanh dương `#3b82f6`, badge `i`.
  - 🟡 **Warning**: Viền trái vàng cam `#f59e0b`, badge `!`.
- **Close Button**: Nút đóng góc trên bên phải có sẵn hiệu ứng hover và fallback icon tự động hiển thị khi thiếu font icon.
