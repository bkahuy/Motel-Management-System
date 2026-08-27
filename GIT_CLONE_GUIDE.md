# 🚀 HƯỚNG DẪN CLONE VÀ CÀI ĐẶT DỰ ÁN (GIT CLONE GUIDE)

Tài liệu này hướng dẫn chi tiết từng bước cách tải dự án từ Git về máy mới, cài đặt các thư viện cần thiết và khởi chạy toàn bộ hệ thống **Motel Management System**.

---

## 📋 1. Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Link tải |
| :--- | :--- | :--- |
| **Git** | Mọi phiên bản mới nhất | [git-scm.com](https://git-scm.com/downloads) |
| **Java JDK** | **JDK 21** (Eclipse Temurin / Oracle / OpenJDK) | [adoptium.net](https://adoptium.net/) |
| **Node.js & npm** | **Node.js $\ge$ 18.x** (khuyên dùng Node 20 LTS) | [nodejs.org](https://nodejs.org/) |
| **MySQL Server** | **MySQL 8.0 / 8.4** | [mysql.com](https://dev.mysql.com/downloads/installer/) |
| *(Tùy chọn)* **Docker** | Docker Desktop (nếu muốn chạy bằng Docker) | [docker.com](https://www.docker.com/) |

---

## 📥 2. Bước 1: Clone Dự Án Từ Git

Mở Terminal / PowerShell / Git Bash và chạy lệnh:

```bash
# Clone source code về máy
git clone <URL_REPOSITORY_CUA_BAN>

# Di chuyển vào thư mục dự án
cd motel_managerment
```

---

## 🗄️ 3. Bước 2: Chuẩn Bị Cơ Sở Dữ Liệu (MySQL)

### Cách 1: Sử dụng MySQL Server có sẵn trên máy
1. Mở **MySQL Command Line Client** hoặc **MySQL Workbench** / **DBeaver** / **Navicat**.
2. Tạo Database mới có tên `motel_management`:
   ```sql
   CREATE DATABASE motel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. *(Tùy chọn)* Import schema ban đầu từ file `database/init.sql`:
   ```bash
   mysql -u root -p motel_management < database/init.sql
   ```
   > **Lưu ý:** Khi chạy lần đầu, Spring Boot `DataInitializer` cũng sẽ tự động khởi tạo dữ liệu mẫu hoàn chỉnh (Tòa nhà, Phòng trọ, Dịch vụ, Tài khoản, Hợp đồng, Hóa đơn).

4. Kiểm tra cấu hình kết nối DB trong `backend/src/main/resources/application-dev.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/motel_management?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Ho_Chi_Minh
       username: root
       password: # Điền mật khẩu MySQL của bạn tại đây (để trống nếu không có mật khẩu)
   ```

---

## ☕ 4. Bước 3: Cài Đặt & Chạy Backend (Spring Boot 3 + Java 21)

Mở một cửa sổ Terminal mới:

```powershell
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Tải dependencies và kiểm tra unit test
# Đối với Windows:
.\mvnw clean test

# Đối với Linux / macOS:
./mvnw clean test

# 3. Khởi chạy ứng dụng Spring Boot
# Đối với Windows:
.\mvnw spring-boot:run

# Hoặc dùng script 1-click tại thư mục gốc:
cd ..
.\run-backend.ps1
```

* **Backend URL:** `http://localhost:8080`
* **Swagger API Documentation:** `http://localhost:8080/swagger-ui/index.html`
* **OpenAPI JSON Spec:** `http://localhost:8080/v3/api-docs`

---

## ⚛️ 5. Bước 4: Cài Đặt & Chạy Frontend (React + Vite + TypeScript)

Mở một cửa sổ Terminal thứ hai:

```powershell
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt toàn bộ thư viện (node_modules)
npm install

# 3. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# Hoặc dùng script 1-click tại thư mục gốc:
cd ..
.\run-frontend.ps1
```

* **Frontend Web App:** `http://localhost:5173`

---

## 🔑 6. Tài Khoản Mẫu Đăng Nhập Hệ Thống

| Vai trò | Tên đăng nhập / Email | Mật khẩu mặc định | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` hoặc `admin@example.com` | `admin123` | Toàn quyền quản trị hệ thống, tòa nhà, phòng, tài khoản, dịch vụ, hợp đồng, hóa đơn |
| **Nhân viên (Staff)** | `staff` hoặc `staff@example.com` | `staff123` | Quản lý phòng, khách thuê, chỉ số điện nước, dịch vụ, tạo hóa đơn |
| **Khách thuê (Tenant 1)** | `tenant1` hoặc `tenant1@example.com` | `tenant123` | Xem phòng đang thuê, xem hợp đồng, xem hóa đơn tiền trọ, cập nhật hồ sơ cá nhân |
| **Khách thuê (Tenant 2)** | `tenant2` hoặc `tenant2@example.com` | `tenant123` | Xem phòng đang thuê, xem hợp đồng, xem hóa đơn tiền trọ, cập nhật hồ sơ cá nhân |

---

## 🐳 7. Khởi Chạy Nhanh Bằng Docker (Tùy Chọn)

Nếu máy bạn đã có sẵn **Docker** & **Docker Compose**, bạn chỉ cần 1 lệnh duy nhất:

```bash
docker-compose up -d --build
```
Hệ thống sẽ tự động build và chạy cả 3 container:
1. `motel_db` (MySQL 8.4 trên cổng `3306`)
2. `motel_backend` (Spring Boot trên cổng `8080`)
3. `motel_frontend` (Nginx + React trên cổng `80`)

---

## 📁 8. Giải Thích File `.gitignore`

File `.gitignore` đã được cấu hình tại thư mục gốc để loại bỏ những file rác, file sinh tự động hoặc file thư viện có thể cài đặt lại:

| Thư mục / File bị bỏ qua | Lý do loại bỏ | Cách tạo/cài lại sau khi clone |
| :--- | :--- | :--- |
| `frontend/node_modules/` | Thư mục thư viện Node.js rất nặng (~200MB - 500MB) | Chạy `npm install` trong thư mục `frontend` |
| `frontend/dist/`, `build/` | Thư mục build sản phẩm của Frontend | Chạy `npm run build` |
| `backend/target/` | Thư mục chứa file `.class` và file `.jar` đã biên dịch của Java | Chạy `mvn compile` hoặc `mvn package` |
| `.idea/`, `.vscode/`, `*.iml` | File cấu hình IDE riêng của từng máy cá nhân | Tự sinh khi mở project bằng IntelliJ / VS Code |
| `.env`, `.env.local` | File chứa cấu hình bí mật / nhạy cảm của từng môi trường | Dựa vào file mẫu `.env.example` để tạo |
| `*.log` | File nhật ký log chạy runtime | Tự sinh khi hệ thống hoạt động |
