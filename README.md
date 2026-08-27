# 🏢 Motel Management System (Hệ Thống Quản Lý Phòng Trọ)

Một hệ thống quản trị và vận hành chuỗi nhà trọ, căn hộ dịch vụ và chung cư mini hiện đại, hoàn chỉnh từ Backend đến Frontend, được thiết kế theo kiến trúc chuẩn Senior Fullstack Developer (Java Spring Boot + ReactJS + TypeScript + MySQL).

---

## 🌟 1. Tổng Quan & Điểm Nổi Bật

Hệ thống cung cấp giải pháp toàn diện cho chủ nhà trọ và người quản lý:
- **Quản lý Tòa nhà & Phòng:** Quản lý danh sách khu trọ, từng phòng, diện tích, giá thuê, tiền cọc, gói dịch vụ đi kèm và trạng thái thời gian thực (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
- **Khách thuê & Hợp đồng:** Hồ sơ cá nhân (CCCD, SĐT, quê quán), tạo hợp đồng thuê phòng với logic đồng bộ trạng thái phòng tự động, thanh lý hợp đồng trả phòng về trạng thái trống.
- **Chỉ số Điện & Nước:** Chốt số công tơ điện nước hàng tháng, tự động tính toán điện năng (kWh) và khối nước ($m^3$) tiêu thụ với kiểm tra ràng buộc số mới $\ge$ số cũ.
- **Lập Hóa đơn & Tính tiền tự động:** Tự động tổng hợp tiền phòng + tiền điện + tiền nước + các dịch vụ đi kèm + phụ phí phát sinh thành hóa đơn chi tiết.
- **Thanh toán & Giao dịch:** Hỗ trợ thanh toán tiền mặt và chuyển khoản ngân hàng với mô phỏng mã QR VietQR theo đúng cú pháp, tự động chuyển hóa đơn sang `PAID` khi nhận đủ tiền.
- **Bảo mật & Phân quyền Role-based:** Spring Security 6 + JWT stateless authentication, phân quyền 3 cấp độ: `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_TENANT`.
- **Dashboard Thống Kê & Doanh Thu:** Biểu đồ diện tích doanh thu Recharts qua các tháng, biểu đồ donut phân bổ trạng thái phòng và các thẻ KPI vận hành.

---

## 🛠️ 2. Tech Stack

### Backend
- **Ngôn ngữ:** Java 21 LTS
- **Framework:** Spring Boot 3.3.x
- **Bảo mật:** Spring Security 6, JJWT 0.12.x (JSON Web Token), BCrypt Password Encoder
- **Database & ORM:** MySQL 8.x, Spring Data JPA, Hibernate, Jakarta Persistence
- **Validation:** Jakarta Bean Validation (`@NotBlank`, `@Positive`, `@Pattern`, `@Size`)
- **API Documentation:** Springdoc OpenAPI 3 / Swagger UI
- **Công cụ hỗ trợ:** Project Lombok, Maven

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Routing:** React Router DOM v6 (Protected Routes & Role-based Access)
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **HTTP Client:** Axios (Interceptors gắn Bearer Token & xử lý 401 tự động)
- **Biểu đồ:** Recharts (AreaChart, PieChart, DonutChart)
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form, Zod

### DevOps & Database
- **Containerization:** Docker, Docker Compose
- **Web Server:** Nginx (Alpine Linux)

---

## 🏛️ 3. Kiến Trúc & Cấu Trúc Thư Mục

```text
motel_management/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/motelmanagement/
│   │   │   │   ├── config/             # Cấu hình Security, JWT, CORS, OpenAPI, DataInitializer
│   │   │   │   ├── controller/         # REST Controllers (Auth, Room, Contract, Invoice...)
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/        # DTO Request với Validation Annotations
│   │   │   │   │   └── response/       # Standard ApiResponse<T>, PageResponse<T>, Entities DTO
│   │   │   │   ├── entity/             # JPA Entities (User, Building, Room, Contract, Invoice...)
│   │   │   │   ├── enums/              # RoleName, RoomStatus, ContractStatus, InvoiceStatus...
│   │   │   │   ├── exception/          # GlobalExceptionHandler, Custom RuntimeExceptions
│   │   │   │   ├── repository/         # Spring Data JPA Repositories & Specifications
│   │   │   │   ├── security/           # UserPrincipal, JwtService, JwtAuthFilter, Handlers
│   │   │   │   ├── service/            # Business Service Interfaces
│   │   │   │   │   └── impl/           # Transactional Service Implementations
│   │   │   │   └── MotelManagementApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-dev.yml
│   │   └── test/java/com/motelmanagement/ # Unit Tests (Contract, Invoice, Payment, Auth)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Modal, ConfirmDialog, Badge, Pagination, Skeleton, EmptyState
│   │   │   ├── layout/                 # AdminLayout, Navbar, Sidebar, ProtectedRoute
│   │   │   └── modal/                  # ChangePasswordModal...
│   │   ├── contexts/                   # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── auth/                   # LoginPage
│   │   │   ├── dashboard/              # DashboardPage
│   │   │   ├── buildings/              # BuildingListPage, BuildingModal
│   │   │   ├── rooms/                  # RoomListPage, RoomFormModal, RoomDetailModal, AssignModal
│   │   │   ├── tenants/                # TenantListPage, TenantFormModal, TenantDetailModal
│   │   │   ├── contracts/              # ContractListPage, ContractFormModal, TerminateModal...
│   │   │   ├── meter-readings/         # MeterReadingListPage, MeterReadingFormModal
│   │   │   ├── services/               # ServiceListPage, ServiceFormModal
│   │   │   ├── invoices/               # InvoiceListPage, InvoiceCreateModal, PayModal, DetailModal
│   │   │   ├── payments/               # PaymentListPage
│   │   │   └── users/                  # UserListPage, UserFormModal
│   │   ├── routes/                     # AppRoutes
│   │   ├── services/                   # Axios instance & API endpoints
│   │   ├── types/                      # TypeScript definitions & Models
│   │   ├── utils/                      # formatCurrency, formatDate, getStatusBadge...
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── database/
│   └── init.sql                        # Schema DDL và dữ liệu mẫu khởi tạo
├── docker-compose.yml                  # Khởi chạy fullstack container (MySQL + Backend + Frontend)
├── .env.example                        # Mẫu biến môi trường
└── README.md
```

---

## 🗄️ 4. Sơ Đồ Cơ Sở Dữ Liệu (ERD)

```text
┌──────────────┐          1:N         ┌──────────────┐
│    roles     │─────────────────────>│    users     │
└──────────────┘                      └──────────────┘
                                             │
                                             │ 1:1 (optional)
                                             v
┌──────────────┐          1:N         ┌──────────────┐
│  buildings   │─────────────────────>│   tenants    │
└──────────────┘                      └──────────────┘
       │                                     │
       │ 1:N                                 │ 1:N
       v                                     v
┌──────────────┐          1:N         ┌──────────────┐
│    rooms     │─────────────────────>│  contracts   │
└──────────────┘                      └──────────────┘
       │                                     │
       │ N:N (via room_services)             ├──────────────────────────┐
       v                                     │ 1:N                      │ 1:N
┌──────────────┐                             v                          v
│   services   │                      ┌──────────────┐           ┌──────────────┐
└──────────────┘                      │meter_readings│           │   invoices   │
                                      └──────────────┘           └──────────────┘
                                                                        │
                                                    ┌───────────────────┴───────────────────┐
                                                    │ 1:N                                   │ 1:N
                                                    v                                       v
                                             ┌──────────────┐                        ┌──────────────┐
                                             │invoice_items │                        │   payments   │
                                             └──────────────┘                        └──────────────┘
```

---

## 🔑 5. Tài Khoản Demo (Pre-seeded)

Khi ứng dụng khởi chạy lần đầu, `DataInitializer` sẽ tự động tạo sẵn các tài khoản demo:

| Vai Trò | Tên Đăng Nhập / Email | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` / `admin@example.com` | `Admin@123` | Toàn quyền quản trị hệ thống, người dùng, tài chính |
| **Nhân viên (STAFF)** | `staff` / `staff@example.com` | `Staff@123` | Quản lý tòa nhà, phòng, khách thuê, hợp đồng, hóa đơn |
| **Khách thuê (TENANT)** | `tenant1` / `tenant1@example.com` | `Tenant@123` | Xem phòng, hợp đồng, hóa đơn và thanh toán cá nhân |

> Giao diện trang đăng nhập đã tích hợp sẵn **Nút điền nhanh 1-Click** cho 3 loại tài khoản để thuận tiện kiểm thử.

---

## 🚀 6. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Cách 1: Chạy trực tiếp trên máy Local (Khuyến nghị)

#### Bước 1: Khởi động MySQL Database
- Tạo database `motel_management` trong MySQL:
```sql
CREATE DATABASE motel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Bước 2: Chạy Backend (Spring Boot)
1. Di chuyển vào thư mục backend:
```bash
cd backend
```
2. Chạy ứng dụng bằng Maven:
```bash
mvn spring-boot:run
```
*(Backend sẽ khởi động tại cổng `http://localhost:8080` và tự động nạp dữ liệu mẫu seed data)*

- Swagger UI API Docs: `http://localhost:8080/swagger-ui.html`

#### Bước 3: Chạy Frontend (React + Vite)
1. Mở một terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
```
2. Cài đặt dependencies:
```bash
npm install
```
3. Khởi động môi trường phát triển:
```bash
npm run dev
```
4. Truy cập giao diện ứng dụng tại: `http://localhost:5173`

---

### Cách 2: Chạy toàn bộ hệ thống bằng Docker Compose

Nếu máy tính đã cài đặt Docker & Docker Compose:
```bash
docker-compose up --build -d
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **Swagger Docs:** `http://localhost:8080/swagger-ui.html`
- **MySQL:** `localhost:3306`

---

## 📋 7. Danh Sách RESTful API Chính

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login`: Đăng nhập, nhận JWT Token
- `POST /api/auth/register`: Đăng ký tài khoản khách thuê mới
- `GET  /api/auth/me`: Lấy thông tin tài khoản hiện tại
- `PUT  /api/auth/change-password`: Đổi mật khẩu

### 🏢 Tòa Nhà (`/api/buildings`)
- `GET    /api/buildings`: Danh sách tòa nhà có phân trang, tìm kiếm
- `GET    /api/buildings/all`: Lấy toàn bộ tòa nhà
- `GET    /api/buildings/{id}`: Chi tiết tòa nhà
- `POST   /api/buildings`: Thêm tòa nhà mới (Admin)
- `PUT    /api/buildings/{id}`: Cập nhật tòa nhà (Admin)
- `DELETE /api/buildings/{id}`: Xóa tòa nhà (Admin)

### 🚪 Phòng Trọ (`/api/rooms`)
- `GET    /api/rooms`: Danh sách phòng (tìm kiếm, lọc tòa nhà, lọc trạng thái, phân trang)
- `GET    /api/rooms/available`: Danh sách phòng trống
- `GET    /api/rooms/{id}`: Chi tiết phòng
- `POST   /api/rooms`: Tạo phòng mới (Admin/Staff)
- `PUT    /api/rooms/{id}`: Cập nhật thông tin phòng (Admin/Staff)
- `POST   /api/rooms/{id}/services`: Gán dịch vụ cho phòng (Admin/Staff)
- `DELETE /api/rooms/{id}`: Xóa phòng (Admin/Staff)

### 👥 Khách Thuê (`/api/tenants`)
- `GET    /api/tenants`: Danh sách khách thuê có phân trang & tìm kiếm
- `GET    /api/tenants/{id}`: Chi tiết khách thuê
- `POST   /api/tenants`: Thêm khách thuê mới (Admin/Staff)
- `PUT    /api/tenants/{id}`: Cập nhật khách thuê (Admin/Staff)
- `DELETE /api/tenants/{id}`: Xóa khách thuê (Admin/Staff)

### 📄 Hợp Đồng Thuê (`/api/contracts`)
- `GET    /api/contracts`: Danh sách hợp đồng (lọc theo phòng, khách, trạng thái)
- `GET    /api/contracts/{id}`: Chi tiết hợp đồng
- `POST   /api/contracts`: Tạo hợp đồng mới (Tự động chuyển phòng sang `OCCUPIED`)
- `PUT    /api/contracts/{id}`: Cập nhật hợp đồng
- `PATCH  /api/contracts/{id}/terminate`: Thanh lý hợp đồng (Tự động chuyển phòng về `AVAILABLE`)

### ⚡ Chỉ Số Điện Nước (`/api/meter-readings`)
- `GET    /api/meter-readings`: Danh sách chỉ số điện nước theo tháng & phòng
- `GET    /api/meter-readings/latest/{contractId}`: Lấy chỉ số chốt gần nhất
- `POST   /api/meter-readings`: Ghi nhận chỉ số điện nước mới
- `PUT    /api/meter-readings/{id}`: Cập nhật chỉ số
- `DELETE /api/meter-readings/{id}`: Xóa bản ghi chỉ số

### ✨ Dịch Vụ (`/api/services`)
- `GET    /api/services`: Danh sách dịch vụ
- `GET    /api/services/all`: Toàn bộ dịch vụ đang hoạt động
- `POST   /api/services`: Tạo mới dịch vụ
- `PUT    /api/services/{id}`: Cập nhật dịch vụ
- `DELETE /api/services/{id}`: Tạm ngưng dịch vụ

### 🧾 Hóa Đơn & Thu Tiền (`/api/invoices`)
- `GET    /api/invoices`: Danh sách hóa đơn có phân trang, lọc theo tháng & trạng thái
- `GET    /api/invoices/{id}`: Chi tiết hóa đơn
- `POST   /api/invoices/calculate-preview`: Xem trước bảng tính tiền hóa đơn
- `POST   /api/invoices`: Phát hành hóa đơn tiền phòng
- `POST   /api/invoices/{id}/pay`: Thanh toán hóa đơn (Chuyển khoản / Tiền mặt)
- `GET    /api/invoices/{id}/payments`: Lịch sử các lần thanh toán của hóa đơn

### 💳 Lịch Sử Thanh Toán (`/api/payments`)
- `GET    /api/payments`: Nhật ký tất cả giao dịch thanh toán

### 📊 Thống Kê Dashboard (`/api/dashboard`)
- `GET    /api/dashboard/statistics`: Thống kê tổng số phòng, đang thuê, trống, doanh thu tháng, nợ chưa thu
- `GET    /api/dashboard/revenue`: Doanh thu thực tế theo 6 hoặc 12 tháng gần nhất
- `GET    /api/dashboard/room-status`: Tỷ lệ phần trăm và số lượng phòng theo trạng thái

### 👤 Quản Lý Tài Khoản (`/api/users` - Admin only)
- `GET    /api/users`: Danh sách người dùng
- `POST   /api/users`: Tạo tài khoản mới
- `PUT    /api/users/{id}`: Cập nhật thông tin
- `PATCH  /api/users/{id}/toggle-status`: Khóa / Mở khóa tài khoản
- `DELETE /api/users/{id}`: Xóa tài khoản

---

## 🧪 8. Kiểm Thử (Testing)

Dự án bao gồm bộ Unit Test và Integration Test kiểm tra toàn bộ các nghiệp vụ quan trọng:
- **Contract Lifecycle:** Tạo hợp đồng chuyển trạng thái phòng sang `OCCUPIED`, thanh lý chuyển về `AVAILABLE`.
- **Validation Rules:** Kiểm tra ngày kết thúc sau ngày bắt đầu, chặn tạo hợp đồng cho phòng đang thuê, chặn ghi chỉ số mới nhỏ hơn chỉ số cũ.
- **Invoice Auto Calculation:** Kiểm tra công thức tính tiền điện, nước, phòng, dịch vụ và phụ phí.
- **Payment Processing:** Kiểm tra thanh toán và tự động cập nhật trạng thái hóa đơn sang `PAID`.

Chạy kiểm thử:
```bash
cd backend
mvn test
```

---

## 💡 9. Hướng Phát Triển Mở Rộng Trong Tương Lai
- [ ] Tích hợp cổng thanh toán trực tuyến tự động (VNPay, MoMo, ZaloPay API).
- [ ] Gửi thông báo nhắc đóng tiền phòng qua Email (Spring Mail) và Zalo ZNS / SMS.
- [ ] Xuất hóa đơn ra định dạng PDF chính thức cho khách thuê.
- [ ] Ứng dụng di động (React Native) cho khách thuê quản lý và báo hỏng thiết bị.
- [ ] Tích hợp quản lý thiết bị IoT (công tơ điện thông minh tử tế tự truyền chỉ số qua MQTT).

---

## 📜 License
Dự án được phát hành theo giấy phép **MIT License**.
