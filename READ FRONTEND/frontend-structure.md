# Frontend Structure — Urban Air Quality Platform

## 1. Cấu trúc ban đầu khi mở Visual Studio Code

Khi mở thư mục `frontend/` trong VSCode, bạn sẽ thấy cấu trúc sau (**chưa chạy lệnh gì**):

```
frontend/
├── .editorconfig
├── .gitignore
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── angular.json
├── package.json
├── package-lock.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
│
└── src/
    ├── favicon.ico
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── leaflet-idw.d.ts
    │
    ├── assets/
    │   ├── .gitkeep
    │   ├── logo.png
    │   └── i18n/
    │       ├── en.json
    │       └── vi.json
    │
    ├── environments/
    │   ├── environment.ts
    │   └── environment.prod.ts
    │
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        │
        ├── core/
        │   ├── auth/
        │   │   └── auth.service.ts
        │   ├── guards/
        │   │   └── auth.guard.ts
        │   ├── interceptors/
        │   │   └── mock.interceptor.ts
        │   ├── models/
        │   │   └── index.ts
        │   ├── mock-data/
        │   │   ├── index.ts
        │   │   ├── alerts.mock.ts
        │   │   ├── aqi.mock.ts
        │   │   ├── others.mock.ts
        │   │   ├── stations.mock.ts
        │   │   └── users.mock.ts
        │   └── services/
        │       ├── alert.service.ts
        │       ├── aqi.service.ts
        │       ├── audit.service.ts
        │       ├── export.service.ts
        │       ├── mock-websocket.service.ts
        │       ├── mqtt.service.ts
        │       ├── station.service.ts
        │       ├── upload.service.ts
        │       └── webhook.service.ts
        │
        ├── shared/
        │   ├── components/
        │   │   ├── header/
        │   │   │   └── header.component.ts
        │   │   ├── layout/
        │   │   │   └── layout.component.ts
        │   │   └── sidebar/
        │   │       └── sidebar.component.ts
        │   ├── directives/
        │   │   ├── index.ts
        │   │   ├── aqi-level.directive.ts
        │   │   └── click-outside.directive.ts
        │   └── pipes/
        │       ├── index.ts
        │       ├── aqi-color.pipe.ts
        │       ├── safe-html.pipe.ts
        │       └── time-ago.pipe.ts
        │
        ├── store/
        │   ├── app.state.ts
        │   ├── alerts/
        │   │   ├── alerts.actions.ts
        │   │   ├── alerts.effects.ts
        │   │   ├── alerts.reducer.ts
        │   │   └── alerts.selectors.ts
        │   ├── aqi/
        │   │   ├── aqi.actions.ts
        │   │   ├── aqi.effects.ts
        │   │   ├── aqi.reducer.ts
        │   │   └── aqi.selectors.ts
        │   ├── auth/
        │   │   ├── auth.actions.ts
        │   │   ├── auth.effects.ts
        │   │   ├── auth.reducer.ts
        │   │   └── auth.selectors.ts
        │   └── stations/
        │       ├── stations.actions.ts
        │       ├── stations.effects.ts
        │       ├── stations.reducer.ts
        │       └── stations.selectors.ts
        │
        └── features/
            ├── auth/
            │   └── login/
            │       └── login.component.ts
            ├── dashboard/
            │   └── dashboard.component.ts
            ├── map/
            │   ├── realtime/
            │   │   └── map-realtime.component.ts
            │   ├── history/
            │   │   └── map-history.component.ts
            │   ├── forecast/
            │   │   └── map-forecast.component.ts
            │   ├── sources/
            │   │   └── map-sources.component.ts
            │   └── deck3d/
            │       └── map-deck3d.component.ts
            ├── monitoring/
            │   ├── realtime/
            │   │   └── monitoring-realtime.component.ts
            │   ├── station-detail/
            │   │   └── station-detail.component.ts
            │   └── compare/
            │       └── compare.component.ts
            ├── alerts/
            │   ├── active/
            │   │   └── alerts-active.component.ts
            │   ├── history/
            │   │   └── alerts-history.component.ts
            │   └── config/
            │       └── alerts-config.component.ts
            ├── forecast/
            │   ├── dashboard/
            │   │   └── forecast-dashboard.component.ts
            │   ├── models/
            │   │   └── forecast-models.component.ts
            │   └── evaluation/
            │       └── forecast-evaluation.component.ts
            ├── analytics/
            │   ├── reports/
            │   │   └── analytics-reports.component.ts
            │   ├── pivot/
            │   │   └── analytics-pivot.component.ts
            │   ├── trends/
            │   │   └── analytics-trends.component.ts
            │   └── compliance/
            │       └── analytics-compliance.component.ts
            ├── stations/
            │   ├── list/
            │   │   └── stations-list.component.ts
            │   └── devices/
            │       └── stations-devices.component.ts
            ├── sources/
            │   └── sources.component.ts
            ├── community/
            │   ├── submit/
            │   │   └── community-submit.component.ts
            │   ├── manage/
            │   │   └── community-manage.component.ts
            │   └── lookup/
            │       └── community-lookup.component.ts
            ├── admin/
            │   ├── users/
            │   │   └── admin-users.component.ts
            │   ├── roles/
            │   │   └── admin-roles.component.ts
            │   ├── api-keys/
            │   │   └── admin-api-keys.component.ts
            │   ├── webhooks/
            │   │   └── admin-webhooks.component.ts
            │   ├── integrations/
            │   │   └── admin-integrations.component.ts
            │   ├── system/
            │   │   └── admin-system.component.ts
            │   ├── health/
            │   │   └── admin-health.component.ts
            │   └── audit-log/
            │       └── admin-audit-log.component.ts
            ├── profile/
            │   └── profile.component.ts
            └── data-import/
                ├── data-import.component.ts
                ├── data-import.component.html
                └── data-import.component.scss
```

> **Tổng cộng:** 94 file source · 38 feature components · 9 services · 6 mock data files · 16 store files

---

## 2. Lệnh chạy

### Bước 1 — Cài dependencies

```bash
npm install --legacy-peer-deps
```

**Thư mục sinh thêm:**

```
frontend/
└── node_modules/          ← ~1.2GB, chứa toàn bộ packages
    ├── @angular/
    └── ... (hàng nghìn packages khác)
```

### Bước 2 — Chạy Development Server

```bash
npm start
```

hoặc:

```bash
npx ng serve --port 4200
```

**Thư mục sinh thêm:**

```
frontend/
└── .angular/
    └── cache/
        └── 17.3.x/          ← build cache (~200MB)
            ├── angular-webpack/
            ├── babel-webpack/
            └── vite/
```

**Kết quả:** mở trình duyệt tại **http://localhost:4200** để trải nghiệm web.

### Bước 3 — Build Production (tùy chọn)

```bash
npm run build
```

hoặc:

```bash
npx ng build --configuration production
```

**Thư mục sinh thêm:**

```
frontend/
└── dist/
    └── urban-air/
        └── browser/
            ├── index.html
            ├── favicon.ico
            ├── main-[hash].js
            ├── polyfills-[hash].js
            ├── styles-[hash].css
            ├── chunk-[hash].js        ← lazy-loaded modules
            ├── chunk-[hash].js
            ├── ...
            └── assets/
                ├── logo.png
                └── i18n/
                    ├── en.json
                    └── vi.json
```

### Cấu trúc hoàn chỉnh sau khi chạy tất cả lệnh

```
frontend/
├── .angular/                  ← build cache (gitignored)
├── .editorconfig
├── .gitignore
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── angular.json
├── dist/                      ← production build output (gitignored)
│   └── urban-air/
│       └── browser/
├── nghiệp vụ.md
├── node_modules/              ← dependencies (gitignored)
├── package.json
├── package-lock.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
│
└── src/                       ← source code (không thay đổi)
    └── (giữ nguyên như cấu trúc ban đầu ở mục 1)
```

---

## 3. Trải nghiệm Web trên trình duyệt

```
Bước 1:  npm install --legacy-peer-deps
Bước 2:  npm start
Bước 3:  Mở trình duyệt → http://localhost:4200
```

**Tài khoản demo đăng nhập:**

| Username | Password | Role |
|----------|----------|------|
| `admin` | *(bất kỳ)* | Admin — truy cập toàn bộ |
| `expert` | *(bất kỳ)* | Chuyên gia — phân tích & dự báo |
| `operator` | *(bất kỳ)* | Vận hành — giám sát & xử lý |

> Hệ thống sử dụng **mock authentication** — nhập username hợp lệ và password bất kỳ.

**Sitemap trên trình duyệt:**

```
/auth/login                       Đăng nhập
/dashboard                        Dashboard Tổng quan
/map/realtime                     Bản đồ Thời gian thực (Leaflet)
/map/history                      Bản đồ Lịch sử
/map/forecast                     Bản đồ Dự báo
/map/sources                      Bản đồ Nguồn ô nhiễm
/map/3d                           Bản đồ 3D (Deck.gl)
/monitoring/realtime              Giám sát AQI Realtime (DataGrid)
/monitoring/station/:id           Chi tiết Trạm
/monitoring/compare               So sánh Trạm
/alerts/active                    Cảnh báo Đang hoạt động
/alerts/history                   Lịch sử Cảnh báo + Heatmap D3
/alerts/config                    Cấu hình Cảnh báo
/forecast/dashboard               Dự báo AI/ML Dashboard
/forecast/models                  Mô hình ML
/forecast/evaluation              Đánh giá Mô hình
/analytics/reports                Báo cáo Tùy chỉnh
/analytics/pivot                  PivotTable
/analytics/trends                 Xu hướng
/analytics/compliance             Tuân thủ Quy chuẩn
/stations/list                    Danh sách Trạm
/stations/devices                 Thiết bị & Bảo trì
/sources                          Nguồn Ô nhiễm
/community/submit                 Gửi Phản ánh
/community/manage                 Quản lý Phản ánh
/community/lookup                 Tra cứu & Bản đồ Phản ánh
/admin/users                      Quản lý Người dùng
/admin/roles                      Vai trò & Quyền
/admin/api-keys                   API Keys
/admin/webhooks                   Quản lý Webhook
/admin/integrations               Tích hợp
/admin/system                     Cấu hình Hệ thống
/admin/health                     Trạng thái Health
/admin/audit-log                  Nhật ký Hệ thống
/profile                          Hồ sơ Cá nhân
/data-import                      Import Dữ liệu
```

---

## 4. Tương thích với Backend

### Kiến trúc kết nối

```
┌─────────────────────┐         ┌──────────────────────────┐
│     Angular SPA     │◄──REST──►  API Gateway (Go/Gin)    │
│   localhost:4200    │         │  localhost:8080           │
│                     │◄─MQTT──►  Mosquitto MQTT Broker    │
│                     │         │  localhost:1883           │
│                     │◄──WS───►  WebSocket Server         │
│                     │         │  localhost:8080/ws        │
└─────────────────────┘         └──────────────────────────┘
```

### Các điểm tích hợp cụ thể

| Tầng Frontend | Chuẩn bị cho Backend | File chịu trách nhiệm |
|---|---|---|
| **REST API** | Tất cả services sử dụng `HttpClient`, hiện trả mock data. Khi có backend, chỉ cần thay URL trong `environment.ts` | `environment.ts` → `apiUrl` |
| **Authentication** | Sử dụng JWT token flow. `auth.service.ts` hiện mock, sẵn sàng gọi Keycloak/OAuth2 | `auth.service.ts`, `auth.guard.ts` |
| **MQTT Realtime** | `mqtt.service.ts` đã cấu hình kết nối MQTT broker qua WebSocket. Topic pattern: `hn/station/{id}/data` | `mqtt.service.ts` |
| **WebSocket** | `mock-websocket.service.ts` mô phỏng real-time push. Thay bằng WebSocket thật khi deploy | `mock-websocket.service.ts` |
| **HTTP Interceptors** | `mock.interceptor.ts` chặn HTTP request → trả mock data. **Tắt interceptor này** khi kết nối backend thật | `mock.interceptor.ts` |
| **State Management** | NgRx Store đã có Actions/Effects/Reducers cho `aqi`, `alerts`, `stations`, `auth`. Effects sẽ gọi API thật | `store/` |
| **Export** | `export.service.ts` dùng ExcelJS + jsPDF — chạy hoàn toàn client-side, không cần backend | `export.service.ts` |
| **i18n** | `@ngx-translate` với file JSON tĩnh, không phụ thuộc backend | `assets/i18n/` |

### Cách chuyển từ Mock sang Backend thật

**Bước 1** — Cập nhật `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',    // ← URL backend
  mqttUrl: 'ws://localhost:9001',            // ← MQTT WebSocket
  keycloakUrl: 'http://localhost:8180',      // ← Keycloak
};
```

**Bước 2** — Tắt Mock Interceptor trong `app.config.ts`:

```typescript
// Xóa hoặc comment dòng:
// { provide: HTTP_INTERCEPTORS, useClass: MockInterceptor, multi: true }
```

**Bước 3** — Các service tự động gọi API thật qua `HttpClient`:

```
GET    /api/v1/stations           → station.service.ts
GET    /api/v1/aqi/current        → aqi.service.ts
GET    /api/v1/alerts             → alert.service.ts
POST   /api/v1/auth/login         → auth.service.ts
GET    /api/v1/webhooks           → webhook.service.ts
POST   /api/v1/community/reports  → community-submit
GET    /api/v1/admin/audit-log    → audit.service.ts
```

### Dependencies dành cho Backend Integration

```json
{
  "@ngrx/store": "^17.2.0",        // State management → dispatch API calls
  "@ngrx/effects": "^17.2.0",      // Side effects → HTTP requests
  "mqtt": "^5.15.0",               // MQTT client → real-time sensor data
  "@ngx-translate/core": "^17.2.0" // i18n → có thể load từ API
}
```

### Tổng quan Tech Stack

```
Angular 17.3       Framework chính (Standalone Components, Signals)
TypeScript 5.4     Ngôn ngữ
Tailwind CSS 3.4   Utility-first CSS
DevExtreme 25.2    DataGrid, DateBox, Charts
PrimeNG 17         Timeline, UI components
NgRx 17.2          State management (Store/Effects/Entity)
Leaflet 1.9        Bản đồ 2D + MarkerCluster + Heatmap + IDW
Deck.gl 9.2        Bản đồ 3D WebGL
D3.js 7.9          Calendar Heatmap, custom SVG charts
ECharts 6.0        Line/Bar/Pie/Gauge charts
ExcelJS 4.4        Export Excel (.xlsx) client-side
jsPDF 4.2          Export PDF client-side
MQTT.js 5.15       Real-time MQTT over WebSocket
Font Awesome 7.2   Icon system
```
