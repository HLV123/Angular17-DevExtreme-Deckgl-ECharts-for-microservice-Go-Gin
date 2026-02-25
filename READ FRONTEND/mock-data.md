# Mock Data — Urban Air Quality Platform

## Tổng quan

Frontend sử dụng **mock data** tích hợp để chạy độc lập khi chưa có backend. Dữ liệu mock được quản lý trong `src/app/core/mock-data/`.

| File | Nội dung | Số lượng |
|------|---------|----------|
| `aqi.mock.ts` | Trạm, readings AQI, sparkline, forecast | 20 trạm |
| `stations.mock.ts` | Danh sách trạm + sensors chi tiết | 20 trạm, 160 sensors |
| `alerts.mock.ts` | Cảnh báo lịch sử + đang hoạt động | 100 cảnh báo |
| `users.mock.ts` | Người dùng + vai trò | 10 users, 5 roles |
| `others.mock.ts` | Phản ánh CĐ, nguồn ô nhiễm, webhooks, API keys | 200+ records |
| `index.ts` | Re-export tất cả mock data | — |

---

## 1. Trạm quan trắc (20 trạm)

| ID | Mã | Tên | Quận | Lat | Lng | Loại | Status |
|---|---|---|---|---|---|---|---|
| ST-001 | HN-HK-01 | Trạm Hoàn Kiếm | Hoàn Kiếm | 21.0285 | 105.8542 | fixed | online |
| ST-002 | HN-DD-01 | Trạm Đống Đa | Đống Đa | 21.0167 | 105.8264 | fixed | online |
| ST-003 | HN-HBT-01 | Trạm Hai Bà Trưng | Hai Bà Trưng | 21.0103 | 105.8553 | fixed | online |
| ST-004 | HN-BĐ-01 | Trạm Ba Đình | Ba Đình | 21.0353 | 105.8142 | fixed | online |
| ST-005 | HN-CG-01 | Trạm Cầu Giấy | Cầu Giấy | 21.0333 | 105.7833 | fixed | online |
| ST-006 | HN-TX-01 | Trạm Thanh Xuân | Thanh Xuân | 20.9933 | 105.8178 | fixed | online |
| ST-007 | HN-HM-01 | Trạm Hoàng Mai | Hoàng Mai | 20.9803 | 105.8514 | fixed | online |
| ST-008 | HN-ĐA-01 | Trạm Đông Anh | Đông Anh | 21.1383 | 105.8467 | fixed | online |
| ST-009 | HN-LB-01 | Trạm Long Biên | Long Biên | 21.0487 | 105.8897 | fixed | online |
| ST-010 | HN-BTL-01 | Trạm Bắc Từ Liêm | Bắc Từ Liêm | 21.0722 | 105.7558 | fixed | online |
| ST-011 | HN-NTL-01 | Trạm Nam Từ Liêm | Nam Từ Liêm | 21.0167 | 105.7500 | fixed | online |
| ST-012 | HN-TĐ-01 | Trạm Tây Hồ | Tây Hồ | 21.0667 | 105.8167 | fixed | online |
| ST-013 | HN-HC-01 | Trạm Hà Đông | Hà Đông | 20.9717 | 105.7783 | fixed | online |
| ST-014 | HN-GL-01 | Trạm Gia Lâm | Gia Lâm | 21.0333 | 105.9333 | mobile | online |
| ST-015 | HN-SĐ-01 | Trạm Sóc Sơn | Sóc Sơn | 21.2500 | 105.8500 | fixed | online |
| ST-016 | HN-TT-01 | Trạm Thanh Trì | Thanh Trì | 20.9217 | 105.8500 | fixed | offline |
| ST-017 | HN-ĐAN-01 | Trạm Di động A | — | 21.0000 | 105.8000 | mobile | online |
| ST-018 | HN-ĐBN-01 | Trạm Di động B | — | 21.0500 | 105.8500 | mobile | maintenance |
| ST-019 | HN-VS-01 | Trạm Vệ tinh 1 | — | 21.1000 | 105.9000 | satellite | online |
| ST-020 | HN-VS-02 | Trạm Vệ tinh 2 | — | 20.9500 | 105.7500 | satellite | offline |

---

## 2. Phạm vi dữ liệu AQI

| Thông số | Range mock |
|----------|-----------|
| AQI | 30 – 250 |
| PM2.5 | 5 – 120 µg/m³ |
| PM10 | 10 – 180 µg/m³ |
| CO | 0.2 – 8.0 mg/m³ |
| NO2 | 5 – 95 µg/m³ |
| SO2 | 3 – 80 µg/m³ |
| O3 | 10 – 110 µg/m³ |
| Nhiệt độ | 18 – 38 °C |
| Độ ẩm | 45 – 95 % |
| Tốc độ gió | 0.5 – 8.0 m/s |

### AQI Level Classification (QCVN)

| AQI | Level | Màu | CSS Class |
|-----|-------|-----|-----------|
| 0–50 | good | #22c55e | `aqi-good` |
| 51–100 | moderate | #eab308 | `aqi-moderate` |
| 101–150 | unhealthy-sg | #f97316 | `aqi-unhealthy-sg` |
| 151–200 | unhealthy | #ef4444 | `aqi-unhealthy` |
| 201–300 | very-unhealthy | #a855f7 | `aqi-very-unhealthy` |
| >300 | hazardous | #7f1d1d | `aqi-hazardous` |

---

## 3. Cảnh báo (100 records)

| Phân bổ theo level | Số lượng |
|----|---|
| warning | 55 |
| critical | 35 |
| emergency | 10 |

| Phân bổ theo status | Số lượng |
|---|---|
| active | 5 |
| acknowledged | 3 |
| processing | 7 |
| closed | 85 |

---

## 4. Phản ánh Cộng đồng (200 records)

| Type | Mô tả | % |
|------|--------|---|
| air_pollution | Ô nhiễm không khí | 40% |
| odor | Mùi hôi | 20% |
| dust | Bụi | 15% |
| burning | Đốt rác/rơm | 15% |
| noise | Tiếng ồn | 5% |
| other | Khác | 5% |

| Status | % |
|--------|---|
| received | 15% |
| classified | 10% |
| assigned | 10% |
| processing | 15% |
| closed | 45% |
| rejected | 5% |

Mỗi phản ánh có `latitude`, `longitude` ngẫu nhiên trong phạm vi Hà Nội (20.9–21.15, 105.7–105.95).

---

## 5. Nguồn ô nhiễm (15 sources)

| Type | Số lượng | Ví dụ |
|------|---------|-------|
| industrial | 5 | KCN Thăng Long, KCN Nội Bài |
| traffic | 4 | Ngã Tư Sở, Cầu Giấy, Ngã Tư Vọng |
| residential | 3 | Bãi rác Nam Sơn, Lò đốt Cầu Diễn |
| agricultural | 2 | Vùng đốt rơm Sóc Sơn, Thanh Trì |
| natural | 1 | Bụi sa mạc (seasonal) |

---

## 6. Webhooks (3 endpoints)

| URL | Events | Status | Deliveries |
|-----|--------|--------|------------|
| https://partner-a.com/api/webhook | alert.new, alert.closed | Active | 4521 |
| https://city-gov.vn/api/aqi-notify | data.hourly, report.ready | Active | 2100 |
| https://research-lab.edu.vn/callback | alert.new, data.hourly | Off | 890 |

---

## 7. ML Models (5 models)

| ID | Algorithm | Status | RMSE | R² |
|---|---|---|---|---|
| mdl_lstm_v3 | LSTM | active | 12.5 | 0.87 |
| mdl_xgb_v2 | XGBoost | shadow | 14.2 | 0.83 |
| mdl_sarima_v1 | SARIMA | archived | 18.5 | 0.78 |
| mdl_rf_v1 | Random Forest | archived | 16.0 | 0.81 |
| mdl_prophet_v1 | Prophet | shadow | 15.8 | 0.82 |

---

## 8. Users (10 accounts)

| Username | Full Name | Role | Department |
|---|---|---|---|
| admin | Nguyễn Quản Trị | admin | CNTT |
| admin2 | Lê Hệ Thống | admin | CNTT |
| expert1 | Trần Chuyên Gia | expert | Phân tích |
| expert2 | Phạm Nghiên Cứu | expert | Phân tích |
| operator1 | Trần Vận Hành | operator | Vận hành |
| operator2 | Lê Giám Sát | operator | Vận hành |
| operator3 | Ngô Xử Lý | operator | Vận hành |
| manager1 | Vũ Giám Đốc | manager | Ban GĐ |
| manager2 | Đỗ Phó GĐ | manager | Ban GĐ |
| viewer | Hoàng Xem | manager | Truyền thông |

---

## 9. Mock Data Generation Pattern

### Auto-refresh (WebSocket mock)

```typescript
// mock-websocket.service.ts
// Push dữ liệu mới mỗi 30 giây
setInterval(() => {
  stations.forEach(station => {
    station.aqi = randomBetween(30, 200);
    station.pm25 = randomBetween(5, 120);
    // ... các parameter khác
  });
  this.subject.next({ type: 'aqi-update', data: stations });
}, 30000);
```

### MQTT mock

```typescript
// mqtt.service.ts
// Simulate sensor data mỗi 60 giây
setInterval(() => {
  const payload = {
    station_id: randomStation(),
    sensors: generateRandomReadings()
  };
  this.messageSubject.next(payload);
}, 60000);
```

---

## 10. Seed Data cho Backend

Khi backend sẵn sàng, chạy seed script:

```bash
cd backend
./scripts/seed-data.sh
```

Script sẽ insert toàn bộ mock data ở trên vào PostgreSQL + TimescaleDB + InfluxDB.
