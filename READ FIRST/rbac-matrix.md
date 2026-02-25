# RBAC Matrix — Urban Air Quality Platform

## 1. Vai trò hệ thống

| Vai trò | Mã | Mô tả |
|---------|-----|--------|
| Quản trị viên | `admin` | Toàn quyền hệ thống, cấu hình, phân quyền |
| Chuyên gia môi trường | `expert` | Phân tích, dự báo, quản lý mô hình ML |
| Cán bộ vận hành | `operator` | Giám sát trạm, xử lý cảnh báo, phản ánh |
| Lãnh đạo | `manager` | Xem dashboard, báo cáo tổng hợp |
| Người dân | `citizen` | Tra cứu AQI, gửi phản ánh (không cần đăng nhập) |

---

## 2. Ma trận Phân quyền Module × Hành động

| Module | Hành động | admin | expert | operator | manager | citizen |
|--------|-----------|:-----:|:------:|:--------:|:-------:|:-------:|
| **Trạm & Thiết bị** | View | ✅ | ✅ | ✅ | 👁 | ❌ |
| | Create / Edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Export | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Giám sát AQI** | View Dashboard | ✅ | ✅ | ✅ | ✅ | 👁 |
| | View Realtime | ✅ | ✅ | ✅ | ✅ | ❌ |
| | View History | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Export Data | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Bản đồ** | View All Maps | ✅ | ✅ | ✅ | ✅ | 👁 |
| | View 3D Map | ✅ | ✅ | ✅ | ✅ | ❌ |
| | View Sources | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Cảnh báo** | View | ✅ | ✅ | ✅ | ✅ | 👁 |
| | Assign | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Process / Close | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Config Thresholds | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Export | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Dự báo AI/ML** | View Forecast | ✅ | ✅ | ✅ | ✅ | 👁 |
| | Manage Models | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Train Model | ✅ | ✅ | ❌ | ❌ | ❌ |
| | A/B Testing | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Báo cáo** | View | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Export PDF/Excel | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Pivot / Trends | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Nguồn ô nhiễm** | View | ✅ | ✅ | ✅ | ✅ | ❌ |
| | Create / Edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Dispersion Model | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Phản ánh CĐ** | Submit (public) | ✅ | ❌ | ✅ | ❌ | ✅ |
| | Lookup (by code) | ✅ | ❌ | ✅ | ❌ | ✅ |
| | Manage / Close | ✅ | ❌ | ✅ | ❌ | ❌ |
| | View All | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Người dùng** | View | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Create / Edit | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Delete / Lock | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vai trò & Quyền** | View | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| **API Keys** | View / Manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Webhooks** | View / Manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Cấu hình chung** | View / Edit | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Health Check** | View | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Audit Log** | View / Export | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Profile** | View / Edit own | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Import Data** | Upload | ✅ | ✅ | ❌ | ❌ | ❌ |

> ✅ = Full access · 👁 = Chỉ xem public data · ❌ = Không truy cập

---

## 3. Sidebar Visibility

```
Menu Item                    admin  expert  operator  manager  citizen
─────────────────────────────────────────────────────────────────────
Tổng quan (Dashboard)          ✅      ✅       ✅        ✅       ❌
Bản đồ
  ├── Thời gian thực           ✅      ✅       ✅        ✅       ❌
  ├── Lịch sử                  ✅      ✅       ✅        ✅       ❌
  ├── Dự báo                   ✅      ✅       ✅        ✅       ❌
  ├── Nguồn ô nhiễm            ✅      ✅       ✅        ✅       ❌
  └── Bản đồ 3D                ✅      ✅       ✅        ✅       ❌
Giám sát AQI
  ├── Realtime                  ✅      ✅       ✅        ✅       ❌
  └── So sánh trạm             ✅      ✅       ✅        ✅       ❌
Cảnh báo & Rủi ro
  ├── Đang hoạt động            ✅      ✅       ✅        ✅       ❌
  ├── Lịch sử                  ✅      ✅       ✅        ✅       ❌
  └── Cấu hình                 ✅      ✅       ❌        ❌       ❌
Dự báo AI/ML
  ├── Dashboard                 ✅      ✅       ✅        ✅       ❌
  ├── Mô hình                  ✅      ✅       ❌        ❌       ❌
  └── Đánh giá                 ✅      ✅       ❌        ❌       ❌
Phân tích dữ liệu
  ├── Báo cáo                  ✅      ✅       ✅        ✅       ❌
  ├── Xu hướng                 ✅      ✅       ✅        ✅       ❌
  └── Tuân thủ Quy chuẩn       ✅      ✅       ✅        ✅       ❌
Trạm & Thiết bị
  ├── Danh sách trạm           ✅      ✅       ✅        ❌       ❌
  └── Thiết bị & Bảo trì       ✅      ✅       ✅        ❌       ❌
Nguồn ô nhiễm                  ✅      ✅       ✅        ✅       ❌
Phản ánh CĐ
  ├── Gửi phản ánh             ✅      ❌       ✅        ❌       ✅
  ├── Quản lý                  ✅      ❌       ✅        ✅       ❌
  └── Tra cứu & Bản đồ         ✅      ❌       ✅        ❌       ✅
Cấu hình hệ thống
  ├── Người dùng               ✅      ❌       ❌        ❌       ❌
  ├── Vai trò & Quyền          ✅      ❌       ❌        ❌       ❌
  ├── API Keys                 ✅      ❌       ❌        ❌       ❌
  ├── Webhooks                 ✅      ❌       ❌        ❌       ❌
  ├── Tích hợp                 ✅      ❌       ❌        ❌       ❌
  ├── Cấu hình chung           ✅      ❌       ❌        ❌       ❌
  ├── Trạng thái Health         ✅      ❌       ❌        ❌       ❌
  └── Nhật ký Hệ thống         ✅      ❌       ❌        ❌       ❌
Import dữ liệu                 ✅      ✅       ❌        ❌       ❌
```

---

## 4. API Endpoint Guards

```
Middleware chain:  JWT verify → Role check → Permission check → Data filter
```

| Endpoint Pattern | Roles Allowed | Ghi chú |
|-----------------|---------------|---------|
| `POST /auth/*` | * (public) | Không cần auth |
| `GET /public/*` | * (API Key) | Xác thực bằng API Key |
| `GET /stations` | admin, expert, operator, manager | manager chỉ xem |
| `POST /stations` | admin, expert | |
| `DELETE /stations/*` | admin | |
| `GET /aqi/*` | admin, expert, operator, manager | |
| `GET /alerts` | admin, expert, operator, manager | |
| `POST /alerts/*/assign` | admin, expert, operator | |
| `POST /alerts/*/close` | admin, expert, operator | |
| `PUT /alert-configs/*` | admin, expert | |
| `GET /forecast` | admin, expert, operator, manager | |
| `POST /models/train` | admin, expert | |
| `POST /reports/generate` | admin, expert, operator | |
| `POST /community/reports` | * (public) | Không cần đăng nhập |
| `GET /community/reports/{code}` | * (public) | Tra cứu bằng mã |
| `GET /community/reports` | admin, operator, manager | |
| `PUT /community/reports/*/status` | admin, operator | |
| `GET /users` | admin | |
| `POST /users` | admin | |
| `GET /roles` | admin | |
| `PUT /roles/*` | admin | |
| `GET /webhooks` | admin | |
| `GET /audit-log` | admin | |
| `GET /system/*` | admin | |
| `POST /data/import` | admin, expert | |

---

## 5. Data-level Filtering

| Vai trò | Filter Rule |
|---------|-------------|
| admin | Không filter — xem tất cả dữ liệu |
| expert | Không filter — xem tất cả dữ liệu |
| operator | Filter theo `department` — cán bộ Q.Hoàn Kiếm chỉ xem trạm quận Hoàn Kiếm |
| manager | Không filter — xem tổng hợp toàn thành phố |
| citizen | Chỉ xem AQI hiện tại (public), phản ánh của chính mình |

### Ví dụ SQL filter cho operator

```sql
-- Khi operator thuộc quận "Hoàn Kiếm"
SELECT * FROM stations WHERE district = 'Hoàn Kiếm';
SELECT * FROM alerts a JOIN stations s ON a.station_id = s.id WHERE s.district = 'Hoàn Kiếm';
```

---

## 6. Tài khoản Demo

| Username | Password | Role | Department |
|----------|----------|------|------------|
| `admin` | bất kỳ | admin | CNTT |
| `expert` | bất kỳ | expert | Phân tích |
| `operator` | bất kỳ | operator | Vận hành |
| `manager` | bất kỳ | manager | Ban Giám đốc |
| `citizen` | — | citizen | — (không đăng nhập) |

> Frontend hiện dùng **mock authentication** — nhập username hợp lệ + password bất kỳ.
