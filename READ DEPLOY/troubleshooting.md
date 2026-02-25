# Troubleshooting — Urban Air Quality Platform

---

## 1. Frontend — Angular

### Lỗi `npm install` thất bại

```
npm ERR! ERESOLVE could not resolve dependency tree
```

**Giải pháp:**

```bash
npm install --legacy-peer-deps
```

---

### Lỗi `ng serve` — port đã bị chiếm

```
Error: listen EADDRINUSE: address already in use :::4200
```

**Giải pháp:**

```powershell
# Tìm process đang dùng port 4200
netstat -ano | findstr :4200
# Kill PID
taskkill /PID <PID> /F

# Hoặc dùng port khác
npx ng serve --port 4201
```

---

### Lỗi build — Property does not exist

```
error TS2339: Property 'xxx' does not exist on type 'yyy'
```

**Giải pháp:**

```
1. Kiểm tra khai báo type/interface trong core/models/index.ts
2. Đảm bảo import đúng module
3. Nếu dùng DevExtreme, check version compatibility trong package.json
```

---

### Lỗi Leaflet — Map không hiển thị

```
Tiles xám, không load bản đồ
```

**Giải pháp:**

```typescript
// Đảm bảo import CSS trong styles.scss
@import "leaflet/dist/leaflet.css";
@import "leaflet.markercluster/dist/MarkerCluster.css";

// Hoặc trong angular.json → styles[]
"node_modules/leaflet/dist/leaflet.css"
```

---

### Lỗi DevExtreme — License banner

```
For evaluation purposes only. Redistribution prohibited.
```

**Giải pháp:** Đây là bản trial. Để production cần mua license DevExtreme. Không ảnh hưởng chức năng khi dev.

---

### Lỗi D3 — `d3.select is not a function`

```
TypeError: d3.select is not a function
```

**Giải pháp:**

```typescript
// Sai
import d3 from 'd3';

// Đúng
import * as d3 from 'd3';
```

---

### Lỗi NgRx — Action not dispatched

**Kiểm tra:**

```
1. Mở Redux DevTools (Chrome ext) → xem action có được dispatch không
2. Kiểm tra Effects → đã register trong app.config.ts chưa
3. Kiểm tra provideEffects([...effects]) trong providers
```

---

## 2. Backend — Go

### Lỗi `go run` — module not found

```
go: cannot find module providing package ...
```

**Giải pháp:**

```bash
go mod tidy
go mod download
```

---

### Lỗi gRPC connection refused

```
rpc error: code = Unavailable desc = connection error
```

**Kiểm tra:**

```
1. Service target đã chạy chưa: go run cmd/server/main.go
2. Port có đúng không: netstat -ano | findstr :50051
3. Firewall Windows có block port gRPC không
```

---

### Lỗi PostgreSQL connection

```
dial tcp 127.0.0.1:5432: connectex: No connection could be made
```

**Giải pháp:**

```powershell
# Kiểm tra Docker container
docker ps | findstr postgres

# Nếu không chạy
docker start urbanair-postgres

# Kiểm tra kết nối
docker exec -it urbanair-postgres psql -U postgres -d urbanair
```

---

## 3. Infrastructure — Docker

### Docker Desktop không khởi động

```
Docker Desktop - WSL2 backend requires a WSL kernel update
```

**Giải pháp:**

```powershell
# PowerShell (Admin)
wsl --update
wsl --set-default-version 2
# Khởi động lại máy
```

---

### Container không start — port conflict

```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Giải pháp:**

```powershell
# Tìm process chiếm port
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Hoặc đổi port trong docker-compose
ports:
  - "5433:5432"   # map sang port khác
```

---

### Kafka — Consumer lag tăng liên tục

**Triệu chứng:** Messages tích tụ trong Kafka, consumer không xử lý kịp.

**Kiểm tra:**

```bash
# Xem consumer lag
docker exec urbanair-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 --describe --group ingest-service
```

**Giải pháp:**

```
1. Tăng số partitions → cho phép thêm consumer instances
2. Tăng consumer concurrency (KAFKA_CONSUMER_WORKERS)
3. Kiểm tra xem consumer có bị block bởi DB write chậm không
4. Kiểm tra DLQ — nhiều message fail retry
```

---

### Mosquitto — MQTT client không kết nối

```
Error: Connection refused
```

**Kiểm tra:**

```powershell
# Container có chạy không
docker ps | findstr mosquitto

# Test kết nối
mosquitto_sub -h localhost -p 1883 -t "test/#" -v

# Nếu dùng WebSocket (port 9001)
# Kiểm tra mosquitto.conf có listener 9001 + protocol websockets
```

---

### Redis — Memory exceeded

```
OOM command not allowed when used memory > 'maxmemory'
```

**Giải pháp:**

```bash
# Tăng maxmemory
docker exec urbanair-redis redis-cli CONFIG SET maxmemory 512mb

# Hoặc sửa docker-compose
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

---

## 4. ML Pipeline — Python

### Lỗi TensorFlow — CUDA not found

```
Could not load dynamic library 'libcudart.so'
```

**Giải pháp:** Nếu không có GPU, dùng CPU version:

```bash
pip install tensorflow-cpu
```

Hoặc ignore warning — TensorFlow vẫn chạy được trên CPU.

---

### Lỗi model training — Out of memory

```
ResourceExhaustedError: OOM when allocating tensor
```

**Giải pháp:**

```python
# Giảm batch size
hyperparameters = { "batch_size": 16 }  # thay vì 64

# Hoặc giảm sequence length
SEQUENCE_LENGTH = 24  # thay vì 168
```

---

## 5. Network & Distributed Tracing

### Request chậm — không biết bottleneck ở đâu

**Debug chain:**

```
Frontend (DevTools Network tab)
    │ response time?
    ▼
API Gateway (Go logs: latency per request)
    │ gRPC call time?
    ▼
Microservice (Go logs: DB query time)
    │ query time?
    ▼
Database (pg_stat_statements, EXPLAIN ANALYZE)
```

**Tools:**

```
1. Chrome DevTools → Network tab → Timing breakdown
2. API Gateway: log middleware ghi latency
3. PostgreSQL: EXPLAIN ANALYZE cho slow queries
4. Redis: redis-cli SLOWLOG GET 10
5. Kafka: kafka-consumer-groups.sh --describe
6. Grafana dashboards (nếu đã setup)
```

---

## 6. Common Symptoms Checklist

| Triệu chứng | Nguyên nhân có thể | Kiểm tra |
|---|---|---|
| Frontend trắng sau login | Route guard redirect loop | Console → check auth token |
| Map không load tiles | CSP block hoặc thiếu CSS import | Console → Network errors |
| DataGrid không có data | Mock interceptor không match URL | Console → Network tab |
| AQI không auto-refresh | WebSocket mock bị ngắt | Console → WS connections |
| Export Excel file rỗng | DataGrid chưa có data khi export | Đợi data load xong rồi export |
| Docker dùng quá nhiều RAM | Quá nhiều containers | `docker stats` → tắt bớt |
| Build chậm (> 5 phút) | Angular cache corrupted | Xóa `.angular/cache/` |
| `ng serve` hot reload không hoạt động | File watcher limit | Xóa `node_modules/.cache/` |
| Kafka messages mất | Retention policy quá ngắn | Check `KAFKA_LOG_RETENTION_HOURS` |
| Timestamps lệch múi giờ | Không dùng TIMESTAMPTZ | Đảm bảo tất cả là +07:00 |

---

## 7. Useful Debug Commands

```powershell
# === Docker ===
docker ps -a                                    # Tất cả containers
docker logs urbanair-kafka --tail 50            # Xem logs
docker stats                                    # Resource usage
docker exec -it urbanair-postgres psql -U postgres -d urbanair

# === Network ===
netstat -ano | findstr :8080                    # Ai đang dùng port
curl http://localhost:8080/api/v1/system/health # Health check

# === Angular ===
npx ng build 2>&1 | Select-String "error"      # Chỉ xem errors
Remove-Item -Recurse .angular/cache/            # Clear build cache

# === Go ===
go vet ./...                                    # Static analysis
go test -race ./...                             # Race condition check

# === Kafka ===
docker exec urbanair-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
docker exec urbanair-kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic aqi-processed --from-beginning --max-messages 5

# === Redis ===
docker exec urbanair-redis redis-cli INFO memory
docker exec urbanair-redis redis-cli DBSIZE

# === MQTT ===
docker exec urbanair-mosquitto mosquitto_sub -h localhost -t "hn/station/+/data" -v
```
