# Tài liệu đặc tả nghiệp vụ (Functional Specification)
## Company Enterprise Micro-Frontend Portal

| Thuộc tính           | Giá trị                                                 |
| -------------------- | ------------------------------------------------------- |
| **Tên dự án**        | Company Enterprise Micro-Frontend Portal                |
| **Mã tài liệu**      | SPEC-01                                                 |
| **Phiên bản**        | 1.0.0                                                   |
| **Tài liệu tham chiếu** | Technical System Document (`document.md`)              |
| **Trạng thái**       | Đã duyệt / Ban hành                                     |

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Đặc tả chức năng chi tiết](#2-đặc-tả-chức-năng-chi-tiết)
   - 2.1. [Module Xác thực & Tài khoản (MFE Auth)](#21-module-xác-thực--tài-khoản-mfe-auth)
   - 2.2. [Module Tổng quan KPI (MFE Dashboard - Trang Dashboard)](#22-module-tổng-quan-kpi-mfe-dashboard---trang-dashboard)
   - 2.3. [Module Quản lý Dự án Kanban (MFE Dashboard - Trang Projects)](#23-module-quản-lý-dự-án-kanban-mfe-dashboard---trang-projects)
   - 2.4. [Module Báo cáo & Thống kê (MFE Reporting)](#24-module-báo-cáo--thống-kê-mfe-reporting)
   - 2.5. [Khung ứng dụng & Điều hướng toàn cục (App Shell & Navigation)](#25-khung-ứng-dụng--điều-hướng-toàn-cục-app-shell--navigation)
3. [Quy tắc nghiệp vụ (Business Rules)](#3-quy-tắc-nghiệp-vụ-business-rules)
4. [Yêu cầu phi chức năng (Non-Functional Requirements)](#4-yêu-cầu-phi-chức-năng-non-functional-requirements)
5. [Lịch sử thay đổi](#5-lịch-sử-thay-đổi)

---

## 1. Tổng quan dự án

### 1.1. Mục đích hệ thống
Company Enterprise Micro-Frontend Portal là cổng thông tin doanh nghiệp hợp nhất, hỗ trợ quản lý dự án theo mô hình Kanban, theo dõi chỉ số KPI thời gian thực, báo cáo tổng hợp và phân quyền truy cập. Hệ thống được thiết kế theo kiến trúc Micro-Frontend giúp các đội ngũ phát triển có thể triển khai và nâng cấp các phân hệ độc lập.

### 1.2. Đối tượng sử dụng
- **Administrator (Quản trị viên):** Quản lý toàn bộ dự án, cấu hình báo cáo, phân quyền và giám sát hệ thống.
- **User / Team Member (Nhân viên):** Thực hiện công việc, cập nhật tiến độ Kanban, xem bảng điều khiển và xuất báo cáo cá nhân/phòng ban.

---

## 2. Đặc tả chức năng chi tiết

### 2.1. Module Xác thực & Tài khoản (MFE Auth)

#### 2.1.1. Đăng nhập hệ thống (Login)
- **Mã chức năng:** `AUTH-01`
- **Đường dẫn:** `/auth/login`
- **Mô tả:** Cho phép người dùng truy cập vào hệ thống bằng tài khoản doanh nghiệp hoặc SSO.
- **Yêu cầu chi tiết:**
  - Form đăng nhập gồm các trường:
    - **Email/Username:** Bắt buộc nhập, định dạng email chuẩn (Mặc định gợi ý: `name@company.com`).
    - **Mật khẩu (Password):** Bắt buộc nhập, hỗ trợ nút ẩn/hiện mật khẩu (Eye icon toggle).
    - **Ghi nhớ đăng nhập (Remember Me):** Checkbox lưu trạng thái phiên làm việc.
  - **Đăng nhập Single Sign-On (SSO):** Cho phép kích hoạt đăng nhập nhanh bằng 1-click qua Enterprise ID.
  - **Xử lý kết quả:**
    - Đăng nhập thành công: Lưu `mfe_jwt_token` và `mfe_mock_user` vào `localStorage`, phát sự kiện `USER_LOGGED_IN` qua EventBus và chuyển hướng về `/dashboard`.
    - Đăng nhập thất bại: Hiển thị thông báo lỗi `Invalid credentials. Please try again.`.

| Trường dữ liệu | Loại thành phần  | Ràng buộc / Validate                    | Mặc định          |
| -------------- | ---------------- | --------------------------------------- | ----------------- |
| Email          | TDS Input        | Required, Format Email                  | `name@company.com`|
| Password       | TDS Input Password | Required, Min length 6                  | `123456`          |
| Remember Me    | TDS Checkbox     | Optional                                | `true`            |

#### 2.1.2. Quên mật khẩu (Forgot Password Drawer)
- **Mã chức năng:** `AUTH-02`
- **Mô tả:** Cho phép người dùng yêu cầu khôi phục mật khẩu qua Drawer trượt bên phải.
- **Luồng xử lý:**
  1. Người dùng bấm chọn "Forgot password?".
  2. Drawer hiển thị form nhập Email khôi phục.
  3. Người dùng bấm "Send Reset Link" -> Hiển thị hiệu ứng loading.
  4. Hệ thống gửi link khôi phục và chuyển form sang trạng thái thông báo thành công ("Check your email").

---

### 2.2. Module Tổng quan KPI (MFE Dashboard - Trang Dashboard)

- **Mã chức năng:** `DASH-01`
- **Đường dẫn:** `/dashboard` (Yêu cầu đăng nhập - Protected Route)
- **Mô tả:** Hiển thị tổng quan các chỉ số hoạt động (KPI), thống kê tiến độ công việc và trạng thái tổng thể của các dự án.
- **Các thành phần giao diện chính:**
  - **Thẻ KPI (Metric Cards):**
    - Tổng số dự án (Total Projects).
    - Dự án đang thực hiện (Active Projects).
    - Tỷ lệ hoàn thành (Completion Rate %).
    - Tổng số nhiệm vụ quá hạn / cần chú ý.
  - **Biểu đồ & Bảng thống kê nhanh:** Hiển thị danh sách dự án nổi bật và biểu đồ phân bổ công việc theo phòng ban.

---

### 2.3. Module Quản lý Dự án Kanban (MFE Dashboard - Trang Projects)

- **Mã chức năng:** `DASH-02`
- **Đường dẫn:** `/projects` (Protected Route)
- **Mô tả:** Cung cấp bảng Kanban kéo thả tương tác giúp quản lý danh sách công việc/dự án trực quan.

#### 2.3.1. Cấu trúc bảng Kanban
Bảng được chia làm 4 cột trạng thái chuẩn:

| Tên cột        | Mã trạng thái  | Ý nghĩa nghiệp vụ                          |
| -------------- | -------------- | ------------------------------------------ |
| **To Do**      | `todo`         | Công việc mới tạo, chưa bắt đầu            |
| **In Progress**| `in_progress`  | Công việc đang trong quá trình xử lý       |
| **In Review**  | `in_review`    | Công việc đang chờ kiểm thử / duyệt        |
| **Completed**  | `completed`    | Công việc đã hoàn tất 100%                 |

#### 2.3.2. Đặc tả thẻ dự án (Kanban Card Component)
Mỗi thẻ dự án hiển thị đầy đủ thông tin:
- **Tiêu đề dự án (Title):** Hiển thị rõ ràng tên công việc.
- **Mô tả ngắn (Description):** Tóm tắt nội dung.
- **Badge Độ ưu tiên (Priority):**
  - `HIGH`: Nhãn màu đỏ/cam cảnh báo cao.
  - `MEDIUM`: Nhãn màu xanh dương.
  - `LOW`: Nhãn màu xám/xanh lá.
- **Thanh tiến độ (Progress Bar):** Tính theo % hoàn thành hoặc checklist (`checklistDone / checklistTotal`).
- **Thông tin phụ:** Số lượng bình luận (Comments count), Avatar thành viên tham gia.

#### 2.3.3. Các thao tác tương tác (Interactions)

| Thao tác                | Hành vi người dùng                                | Kết quả nghiệp vụ & Thông báo (Toast)                       |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **Kéo thả (Drag & Drop)**| Kéo thẻ từ cột này sang cột khác                  | Cập nhật status mới. Hiển thị Toast Info: `Task Moved`.     |
| **Tạo mới dự án**       | Bấm `+ New Project`, nhập thông tin trong Modal   | Thêm dự án vào cột `To Do`. Hiển thị Toast Success.         |
| **Xem & Sửa chi tiết**  | Click vào thẻ dự án                               | Mở Detail View cho phép sửa Title, Description, Priority.   |
| **Đổi nhanh độ ưu tiên**| Click menu ngữ cảnh trên thẻ -> Change Priority   | Luân chuyển `HIGH` -> `MEDIUM` -> `LOW`. Hiển thị Toast.     |
| **Nhân bản (Duplicate)**| Click menu -> Duplicate Task                      | Tạo bản sao với tên `[Tên gốc] (Copy)`. Toast Info.         |
| **Xóa dự án (Delete)**  | Click menu -> Delete Task                         | Xóa khỏi bảng. Hiển thị Toast Warning.                      |

#### 2.3.4. Lọc và Tìm kiếm (Filter & Search)
- **Tìm kiếm theo từ khóa:** Ô nhập liệu tìm kiếm theo thời gian thực (case-insensitive) khớp với tiêu đề dự án.
- **Lọc theo Tab trạng thái:** `All` | `Active` | `Completed` | `On Hold`.
- **Lọc theo độ ưu tiên:** Dropdown lựa chọn `High Priority`, `Medium Priority`, `Low Priority`.
- **Sắp xếp (Sort):** Dropdown hỗ trợ sắp xếp theo `Recent` (Mới nhất), `Priority` (Độ ưu tiên), hoặc `Name` (Tên A-Z).

---

### 2.4. Module Báo cáo & Thống kê (MFE Reporting)

- **Mã chức năng:** `REP-01`
- **Đường dẫn:** `/reporting` (Protected Route)
- **Mô tả:** Phân tích dữ liệu hiệu suất, danh sách báo cáo chi tiết và hỗ trợ xuất báo cáo định dạng PDF/Excel.

#### 2.4.1. Bộ lọc báo cáo (Report Filter Bar)
- **Cơ chế Draft - Apply State:**
  - Khi người dùng thay đổi các tùy chọn trên UI (Status, Category, Date Range), hệ thống lưu vào trạng thái tạm (Draft State).
  - Khi bấm nút **"Apply Filters"**, hệ thống mới chính thức kích hoạt truy vấn dữ liệu mới và bật hiệu ứng Skeleton Loading.
- **Tùy chọn lọc:**
  - **Trạng thái (Status):** `All` | `Completed` | `Pending`.
  - **Danh mục (Category):** `All Categories` | `Financial` | `User Engagement` | `System Performance`.
  - **Khoảng thời gian (Date Range):** `Last 30 Days` | `Last 90 Days` | `Year to Date` | `Custom Range`.

#### 2.4.2. Danh sách báo cáo chi tiết (Detailed Reports Table)
- Sử dụng component `TDSTableModule` kết hợp `TDSTagModule` để hiển thị:
  - Tên báo cáo.
  - Ngày tạo.
  - Tác giả (Tên + Avatar initials).
  - Trạng thái hoàn thành (`Completed` - Tag xanh, `Pending` - Tag cam).

#### 2.4.3. Xuất dữ liệu (Export Options)
- Nút bấm hỗ trợ xuất báo cáo:
  - **Export Excel (`.xlsx`):** Tải file bảng tính chi tiết.
  - **Export PDF (`.pdf`):** Xuất bản in định dạng PDF chuẩn văn bản doanh nghiệp.

---

### 2.5. Khung ứng dụng & Điều hướng toàn cục (App Shell & Navigation)

- **Mã chức năng:** `SHELL-01`
- **Trách nhiệm:** Quản lý khung giao diện chung, menu điều hướng và phân quyền đường dẫn.

#### 2.5.1. Thành phần Layout chính
- **Header:** Hiển thị Logo doanh nghiệp, Tên ứng dụng, Thông tin người dùng đang đăng nhập và nút Đăng xuất (Logout).
- **Sidebar Navigation:** Menu bên trái hỗ trợ điều hướng nhanh giữa các phân hệ:
  - 📊 Dashboard (`/dashboard`)
  - 📋 Projects Kanban (`/projects`)
  - 📈 Reporting & Analytics (`/reporting`)
  - Tự động Highlight menu items tương ứng với Route hiện tại.

#### 2.5.2. Xử lý bảo mật & Trang lỗi (Guards & Error Pages)
- **Auth Guard:** Kiểm tra sự tồn tại của JWT Token trong LocalStorage trước khi cho phép vào các trang Protected. Nếu chưa đăng nhập, tự động chuyển hướng về `/auth/login`.
- **Trang 403 Forbidden (`page-403`):** Hiển thị khi người dùng truy cập vào chức năng vượt quá thẩm quyền của Role.
- **Trang 404 Not Found (`page-404`):** Hiển thị mascot TDS và thông báo khi đường dẫn URL không tồn tại.

#### 2.5.3. Hệ thống thông báo (Notification Toast System)
- **Kích thước chuẩn:** Width `340px`.
- **Vị trí hiển thị:** Góc trên bên phải (Top Right).
- **Phong cách thiết kế:** Đèn báo trạng thái viền trái (Left border status indicator) kết hợp icon TDS tương ứng với 4 mức: `Success`, `Info`, `Warning`, `Error`.
- **Nút đóng (Close Button):** Kích thước 24×24px tại vị trí `top: 10px; right: 10px`.

---

## 3. Quy tắc nghiệp vụ (Business Rules)

| Mã quy tắc | Tên quy tắc                         | Chi tiết quy tắc                                                                                                  |
| ---------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **BR-01**  | Quyền truy cập phiên làm việc       | Mọi yêu cầu dữ liệu/trang (trừ `/auth/login`) đều phải có `mfe_jwt_token` hợp lệ.                                 |
| **BR-02**  | Đồng bộ sự kiện liên phân hệ (Event)| Sự kiện `USER_LOGGED_IN` và `USER_LOGGED_OUT` phải được phát trên EventBus để tất cả các MFE cập nhật state tức thì. |
| **BR-03**  | Di chuyển Kanban Status             | Khi di chuyển công việc sang cột `Completed`, tiến độ % tự động cập nhật lên 100%.                               |
| **BR-04**  | Áp dụng bộ lọc Báo cáo              | Bộ lọc báo cáo không gọi API ngay khi chọn mà chỉ thực thi khi người dùng bấm nút **Apply Filters**.              |
| **BR-05**  | Tính duy nhất dữ liệu               | Nhiệm vụ tạo mới hoặc sao chép phải có mã ID ngẫu nhiên duy nhất (UUID/Timestamp).                                |

---

## 4. Yêu cầu phi chức năng (Non-Functional Requirements)

### 4.1. Hiệu năng & Tối ưu (Performance)
- **Thời gian tải trang đầu (Initial Load):** < 2.0s trên kết nối mạng tiêu chuẩn.
- **Tải động phân hệ (Lazy Loading):** Các remote MFE (`mfe-auth`, `mfe-dashboard`, `mfe-reporting`) chỉ được tải khi người dùng chuyển hướng tới phân hệ đó.
- **Dung lượng Bundle:** Sử dụng chung thư viện singleton (`@angular/*`, `rxjs`, `tds-ui`) giúp giảm thiểu trùng lặp dung lượng tải.

### 4.2. Giao diện & Trải nghiệm người dùng (UI/UX)
- **Thư viện UI chuẩn:** Tuân thủ 100% Telenor Design System (`tds-ui`).
- **Phản hồi tương tác:** Mọi hành vi CRUD (Thêm, Sửa, Xóa, Kéo thả) phải có phản hồi thị giác ngay lập tức kèm Toast notification.
- **Hỗ trợ trình duyệt:** Tương thích tốt trên Chrome, Firefox, Edge, Safari phiên bản mới hỗ trợ ES2022.

### 4.3. Khả năng bảo trì & Mở rộng (Maintainability)
- **Kiến trúc Monorepo:** Tổ chức mã nguồn rõ ràng trong Nx Workspace, tách biệt giữa ứng dụng (`apps/`) và thư viện dùng chung (`libs/`).
- **Độc lập triển khai:** Mỗi MFE có thể đóng gói và triển khai độc lập mà không ảnh hưởng tới các MFE khác.

---

## 5. Lịch sử thay đổi

| Phiên bản | Ngày       | Tác giả               | Nội dung thay đổi                      |
| --------- | ---------- | --------------------- | -------------------------------------- |
| 1.0.0     | 2026-08-07 | Company Engineering   | Khởi tạo tài liệu đặc tả nghiệp vụ     |
