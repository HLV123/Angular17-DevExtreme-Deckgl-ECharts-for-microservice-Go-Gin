# API Contracts — Urban Air Quality Platform

## Quy ước chung

### Base URL

```
Development:  http://localhost:8080/api/v1
Production:   https://api.urbanair.vn/api/v1
Public API:   https://api.urbanair.vn/api/v1/public
```

### Authentication Header

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-API-Key: <API_KEY>              # chỉ dùng cho Public API
```

### Response Format chuẩn

```json
// Thành công
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
}

// Lỗi
{
  "success": false,
  "error": { "code": "STATION_NOT_FOUND", "message": "Không tìm thấy trạm với ID: ST-999", "details": null }
}
```

### Pagination & Sort

```
?page=1&pageSize=20&sort=createdAt&order=desc
```

### Error Codes

| HTTP | Code | Mô tả |
|------|------|--------|
| 400 | VALIDATION_ERROR | Dữ liệu đầu vào không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập hoặc token hết hạn |
| 403 | FORBIDDEN | Không có quyền truy cập |
| 404 | NOT_FOUND | Không tìm thấy tài nguyên |
| 409 | CONFLICT | Trùng lặp dữ liệu |
| 429 | RATE_LIMITED | Vượt quá giới hạn request |
| 500 | INTERNAL_ERROR | Lỗi server |

---

## 1. Authentication

### POST /auth/login

```json
// Request
{ "username": "admin", "password": "Admin@123" }

// Response 200
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 86400,
    "user": {
      "id": "usr_001", "username": "admin", "fullName": "Nguyễn Quản Trị",
      "email": "admin@urbanair.vn", "role": "admin", "permissions": ["*"]
    }
  }
}
```

### POST /auth/refresh

```json
// Request
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJl..." }
// Response 200
{ "data": { "accessToken": "eyJ...", "expiresIn": 86400 } }
```

### POST /auth/logout

```
Authorization: Bearer <token>
// Response 200
{ "success": true }
```

---

## 2. Stations

### GET /stations

```
Query: ?page=1&pageSize=20&district=&type=&status=&search=
```

```json
{
  "data": [{
    "id": "ST-001", "code": "HN-HK-01", "name": "Trạm Hoàn Kiếm",
    "district": "Hoàn Kiếm", "address": "1 Tràng Tiền, Hoàn Kiếm, Hà Nội",
    "latitude": 21.0285, "longitude": 105.8542,
    "type": "fixed", "status": "online",
    "mqttTopic": "hn/station/ST-001/data",
    "lastDataAt": "2025-02-25T14:30:00+07:00",
    "sensorsCount": 8, "currentAqi": 85
  }],
  "meta": { "page": 1, "pageSize": 20, "total": 20 }
}
```

### POST /stations

```json
// Request
{
  "code": "HN-TX-05", "name": "Trạm Từ Liêm 5", "district": "Nam Từ Liêm",
  "address": "Đường Phạm Hùng", "latitude": 21.0167, "longitude": 105.7833, "type": "fixed"
}
// Response 201
{ "data": { "id": "ST-021", "code": "HN-TX-05", "mqttTopic": "hn/station/ST-021/data", "status": "offline" } }
```

### GET /stations/{id}

Trả thêm `sensors[]` và `maintenanceHistory[]`.

### PUT /stations/{id}

```json
// Request (partial)
{ "name": "Trạm Hoàn Kiếm (CN)", "status": "maintenance" }
```

### DELETE /stations/{id}

Trả 409 nếu trạm đang có dữ liệu.

### GET /stations/{id}/sensors

```json
{
  "data": [{
    "id": "SN-001", "type": "PM2.5", "model": "SDS011", "serial": "SDS-20230615-001",
    "unit": "µg/m³", "warningThreshold": 50, "criticalThreshold": 100,
    "calibratedAt": "2025-01-10", "status": "active", "lastValue": 35.2
  }]
}
```

---

## 3. AQI Data

### GET /aqi/current

```json
{
  "data": [{
    "stationId": "ST-001", "stationName": "Trạm Hoàn Kiếm",
    "aqi": 85, "aqiLevel": "moderate", "aqiColor": "#FFC107",
    "pm25": 35.2, "pm10": 68.0, "co": 1.2, "no2": 28.5, "so2": 12.0, "o3": 45.0,
    "temperature": 28.5, "humidity": 72.0, "windSpeed": 3.2, "windDirection": 180,
    "timestamp": "2025-02-25T14:30:00+07:00"
  }],
  "meta": { "cityAvgAqi": 105, "stationsOnline": 18, "stationsTotal": 20, "dominantPollutant": "PM2.5" }
}
```

### GET /aqi/current/{station_id}

Trả chi tiết station + sub-AQI từng parameter + sparkline24h[] + trend.

### GET /aqi/history

```
Query: ?station_id=ST-001&from=2025-02-20T00:00:00&to=2025-02-25T23:59:59&interval=hourly&parameters=pm25,pm10,aqi
```

```json
{
  "data": {
    "readings": [
      { "timestamp": "2025-02-20T00:00:00+07:00", "aqi": 62, "pm25": 18.5, "pm10": 42.0 }
    ],
    "statistics": {
      "aqi": { "min": 32, "max": 185, "avg": 89.5, "std": 28.3, "p95": 145 }
    }
  }
}
```

### POST /data/import

```
Content-Type: multipart/form-data
Fields: file, stationId, dataType (aqi|sensor_raw), skipDuplicates
```

```json
// Response 202
{ "data": { "jobId": "job_import_001", "status": "queued", "wsChannel": "/ws/import-progress/job_import_001" } }
```

---

## 4. Alerts

### GET /alerts

```
Query: ?page=1&pageSize=20&level=&status=&station_id=&from=&to=
```

```json
{
  "data": [{
    "id": "ALT-001", "stationId": "ST-003", "stationName": "Trạm Hai Bà Trưng",
    "type": "threshold_exceeded", "level": "critical",
    "parameter": "PM2.5", "value": 152.0, "threshold": 100.0, "unit": "µg/m³",
    "status": "active", "assignedTo": null,
    "createdAt": "2025-02-25T08:15:00+07:00"
  }]
}
```

### GET /alerts/{id}

Trả thêm `timeline[]`, `context.sparklineBefore[]`, `context.nearbyStations[]`.

### POST /alerts/{id}/assign

```json
{ "assigneeId": "usr_003", "note": "Giao xử lý khẩn cấp" }
```

### POST /alerts/{id}/close

```json
{ "resolution": "environmental_event", "rootCause": "Đốt rác khu vực lân cận", "actionsTaken": "Lập biên bản", "note": "Chỉ số bình thường sau 2h" }
```

### GET /alert-configs

```json
{
  "data": [{
    "id": "cfg_pm25", "parameter": "PM2.5", "unit": "µg/m³",
    "warningThreshold": 50, "criticalThreshold": 100, "emergencyThreshold": 200,
    "sustainedMinutes": 15, "cooldownMinutes": 60,
    "channels": ["websocket", "email"],
    "criticalChannels": ["websocket", "email", "sms"]
  }]
}
```

### PUT /alert-configs/{id}

```json
{ "warningThreshold": 45, "criticalThreshold": 90, "sustainedMinutes": 10 }
```

---

## 5. Forecast

### GET /forecast

```
Query: ?station_id=ST-001&horizon=24h&model=lstm
```

```json
{
  "data": {
    "stationId": "ST-001", "modelName": "LSTM v3.2", "horizon": "24h",
    "predictions": [
      { "timestamp": "2025-02-25T15:00:00+07:00", "aqi": 92, "pm25": 38.5, "confidence": { "lower": 78, "upper": 108 } }
    ],
    "accuracy": { "rmse": 12.5, "mae": 9.8, "r2": 0.87 }
  }
}
```

### GET /models

```json
{
  "data": [{
    "id": "mdl_lstm_v3", "name": "LSTM v3.2", "algorithm": "LSTM", "status": "active",
    "trainedAt": "2025-02-20", "features": ["pm25", "pm10", "temperature", "humidity", "wind_speed"],
    "metrics": { "rmse": 12.5, "mae": 9.8, "r2": 0.87 }
  }]
}
```

### POST /models/train

```json
// Request
{
  "algorithm": "LSTM",
  "dataRange": { "from": "2024-01-01", "to": "2025-02-25" },
  "stationIds": ["ST-001", "ST-002"],
  "hyperparameters": { "epochs": 100, "batchSize": 32 }
}
// Response 202
{ "data": { "jobId": "job_train_001", "wsChannel": "/ws/training-progress/job_train_001" } }
```

---

## 6. Reports

### POST /reports/generate

```json
{
  "title": "Báo cáo AQI tuần 8/2025", "type": "weekly",
  "dateRange": { "from": "2025-02-17", "to": "2025-02-23" },
  "stationIds": ["ST-001", "ST-002"], "parameters": ["aqi", "pm25"], "format": "pdf"
}
// Response 202
{ "data": { "reportId": "rpt_001", "status": "generating" } }
```

### GET /reports/{id}/download

```
Response: application/pdf
Content-Disposition: attachment; filename="bao_cao_aqi_tuan_8_2025.pdf"
```

---

## 7. Map

### GET /map/aqi-grid

```
Query: ?bounds=20.9,105.7,21.1,105.9&resolution=100
```

```json
{
  "data": {
    "cells": [{ "lat": 20.902, "lng": 105.702, "aqi": 65, "pm25": 22.5 }],
    "method": "IDW"
  }
}
```

### GET /map/pollution-sources

```
Query: ?type=industrial&district=
```

```json
{
  "data": [{
    "id": "PS-001", "name": "KCN Thăng Long", "type": "industrial",
    "latitude": 21.0772, "longitude": 105.7037, "impactLevel": "high"
  }]
}
```

---

## 8. Community Reports

### POST /community/reports

```
Content-Type: multipart/form-data
Fields: type, description, address, latitude, longitude, contactName, contactPhone, anonymous, images[]
```

```json
// Response 201
{ "data": { "code": "PA-2025-A7X3", "status": "received", "message": "Mã tra cứu: PA-2025-A7X3" } }
```

### GET /community/reports/{code}

Trả thông tin phản ánh + `timeline[]` xử lý.

### GET /community/reports

```
Query: ?page=1&pageSize=20&type=&status=&from=&to=
```

### PUT /community/reports/{id}/status

```json
{ "status": "closed", "note": "Đã xử lý", "feedback": "Vấn đề đã được giải quyết." }
```

---

## 9. Users & Roles

### GET /users

```
Query: ?page=1&pageSize=20&role=&department=&status=&search=
```

### POST /users

```json
{ "username": "newuser", "email": "new@urbanair.vn", "fullName": "Người mới", "roleId": "role_operator", "password": "TempPass@123" }
```

### GET /roles

Trả danh sách roles + `permissions{}` matrix.

### PUT /roles/{id}/permissions

```json
{ "permissions": { "stations": ["view", "export"], "aqi": ["view"], "alerts": ["view"] } }
```

### GET /audit-log

```
Query: ?page=1&pageSize=50&user_id=&action=&resource=&from=&to=
```

```json
{
  "data": [{
    "userId": "usr_001", "userName": "admin", "action": "UPDATE",
    "resource": "station", "resourceId": "ST-001",
    "details": { "field": "status", "old": "online", "new": "maintenance" },
    "ip": "192.168.1.100", "timestamp": "2025-02-25T14:30:00+07:00"
  }]
}
```

---

## 10. Integration

### GET /webhooks · POST /webhooks

### POST /webhooks/{id}/test

```json
// Response 200
{ "data": { "statusCode": 200, "responseTime": 245, "responseBody": "{\"ok\":true}" } }
```

### GET /webhooks/{id}/deliveries

### GET /api-keys · POST /api-keys

API key chỉ hiển thị **1 lần duy nhất** khi tạo.

---

## 11. System

### GET /system/health

Trả trạng thái tất cả services + CPU/RAM/Disk.

### GET /system/config · PUT /system/config

### POST /data/upload

```
Content-Type: multipart/form-data
Fields: file, type (csv|excel|model), destination (training_data|weather_data|model_file)
```

---

## 12. Public API (API Key auth)

| Endpoint | Rate Limit | Max Range |
|----------|-----------|-----------|
| GET /public/aqi/current | 1000/hour | — |
| GET /public/aqi/history | 100/hour | 30 days |
| GET /public/stations | 1000/hour | — |
| GET /public/forecast | 500/hour | — |

---

## 13. Webhook Payload

```http
POST https://partner.com/webhook
X-Webhook-Secret: <HMAC-SHA256>
X-Webhook-Event: alert.new
```

```json
{ "event": "alert.new", "timestamp": "...", "data": { "alertId": "ALT-001", "level": "critical", "parameter": "PM2.5", "value": 152.0 } }
```

Event types: `alert.new` · `alert.closed` · `data.hourly` · `report.ready` · `station.offline` · `station.online`
