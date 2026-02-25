# Cài đặt Môi trường Windows — Urban Air Quality Platform

Hướng dẫn cài đặt **tất cả** công cụ cần thiết để chạy full project (Frontend + Backend) trên Windows.

---

## 1. Công cụ Bắt buộc

### 1.1 Node.js (Frontend)

### 1.2 Go (Backend Services)

```powershell
# Kiểm tra
go version    # go1.23.x windows/amd64
```

---

### 1.3 Python (ML Pipeline)

```powershell
# Kiểm tra
python --version    # Python 3.12.x
pip --version       # pip 24.x

# Cài các thư viện ML
pip install numpy pandas scikit-learn tensorflow keras xgboost lightgbm
pip install prophet statsmodels shap matplotlib seaborn jupyter
pip install influxdb-client psycopg2-binary redis minio kafka-python
pip install flask gunicorn grpcio grpcio-tools protobuf
```

---

### 1.4 Docker Desktop (Toàn bộ Infrastructure)

```
Tải:    https://www.docker.com/products/docker-desktop/
Yêu cầu: Windows 10/11 Pro hoặc Home (WSL2)
Cài:    chạy file .exe, khởi động lại máy
```

```powershell
# Kiểm tra
docker --version           # Docker 27.x
docker-compose --version   # Docker Compose v2.x
```

> **Quan trọng:** Bật WSL2 trước khi cài Docker Desktop.
> Mở PowerShell (Admin):

```powershell
wsl --install
# Khởi động lại máy
wsl --set-default-version 2
```

---

### 1.5 Git

---

## 2. Infrastructure Services (chạy qua Docker)

Tất cả services dưới đây được chạy bằng **1 lệnh duy nhất** thông qua `docker-compose.dev.yml`.

Tuy nhiên, nếu muốn cài riêng (không dùng Docker), hướng dẫn dưới đây:

### 2.1 PostgreSQL + TimescaleDB

```
Docker:
  docker run -d --name timescaledb -p 5432:5432 \
    -e POSTGRES_PASSWORD=urbanair \
    timescale/timescaledb:latest-pg16

```

```powershell
# Kiểm tra
psql -U postgres -h localhost -p 5432
```

---

### 2.2 InfluxDB

```
Docker:
  docker run -d --name influxdb -p 8086:8086 \
    -e DOCKER_INFLUXDB_INIT_MODE=setup \
    -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
    -e DOCKER_INFLUXDB_INIT_PASSWORD=urbanair123 \
    -e DOCKER_INFLUXDB_INIT_ORG=urbanair \
    -e DOCKER_INFLUXDB_INIT_BUCKET=sensor_raw \
    influxdb:2.7

```

```powershell
# Kiểm tra: mở trình duyệt
http://localhost:8086
```

---

### 2.3 Redis

```
Docker:
  docker run -d --name redis -p 6379:6379 redis:7-alpine

```

```powershell
# Kiểm tra
redis-cli ping    # PONG
```

---

### 2.4 Apache Kafka + Zookeeper

```
Docker:
  docker run -d --name zookeeper -p 2181:2181 \
    -e ALLOW_ANONYMOUS_LOGIN=yes bitnami/zookeeper:latest

  docker run -d --name kafka -p 9092:9092 \
    -e KAFKA_BROKER_ID=1 \
    -e KAFKA_ZOOKEEPER_CONNECT=host.docker.internal:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
    -e ALLOW_PLAINTEXT_LISTENER=yes bitnami/kafka:latest
```

---

### 2.5 Mosquitto MQTT Broker

```
Docker:
  docker run -d --name mosquitto -p 1883:1883 -p 9001:9001 \
    eclipse-mosquitto:2
```

```powershell
# Kiểm tra
mosquitto_sub -h localhost -t "test/#" &
mosquitto_pub -h localhost -t "test/hello" -m "OK"
```

---

### 2.6 MinIO (Object Storage)

```
Docker:
  docker run -d --name minio -p 9000:9000 -p 9001:9001 \
    -e MINIO_ROOT_USER=minioadmin \
    -e MINIO_ROOT_PASSWORD=minioadmin \
    minio/minio server /data --console-address ":9001"
```

```powershell
# Console: http://localhost:9001
# Login:   minioadmin / minioadmin
```

---

### 2.7 Keycloak (SSO / OAuth2)

```
Docker:
  docker run -d --name keycloak -p 8180:8080 \
    -e KEYCLOAK_ADMIN=admin \
    -e KEYCLOAK_ADMIN_PASSWORD=admin \
    quay.io/keycloak/keycloak:24.0 start-dev
```

```powershell
# Console: http://localhost:8180
# Login:   admin / admin
```

---

### 2.8 Node-RED

```
Docker:
  docker run -d --name nodered -p 1880:1880 nodered/node-red
```

```powershell
# Console: http://localhost:1880
```

---

## 3. Công cụ AI/ML (tùy chọn)

### 3.1 KNIME Analytics Platform

```
Tải:    https://www.knime.com/downloads
Cài:    chạy file .exe
Dùng cho: ETL pipeline, batch data processing
```

### 3.2 Orange Data Mining

```
Tải:    https://orangedatamining.com/download/
Cài:    chạy file .exe
Dùng cho: Visual ML, model training, anomaly detection
```

### 3.3 Spyder IDE

```
Cài qua pip:
  pip install spyder
  spyder

Hoặc cài Anaconda:
  Tải: https://www.anaconda.com/download
  Bao gồm: Spyder + Jupyter + các thư viện khoa học
```

---

## 4. Công cụ Phát triển (IDE & Utilities)

### 4.1 Visual Studio Code

### 4.2 Protocol Buffers Compiler (protoc)

```
Tải:    https://github.com/protocolbuffers/protobuf/releases
File:   protoc-xx.x-win64.zip
Giải nén và thêm bin/ vào PATH

Cài Go plugins:
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

```powershell
protoc --version    # libprotoc 28.x
```

### 4.3 Postman hoặc Insomnia (Test API)

```
Tải Postman:  https://www.postman.com/downloads/
Tải Insomnia: https://insomnia.rest/download
```

### 4.4 DBeaver (Database GUI)

```
Tải:    https://dbeaver.io/download/
Hỗ trợ: PostgreSQL, InfluxDB, Redis
```

### 4.5 MQTT Explorer

```
Tải:    https://mqtt-explorer.com/
Dùng:   debug MQTT messages từ sensor
```

---

## 5. Java Runtime (cho Kafka, Keycloak, KNIME)

```
Tải:    https://adoptium.net/ (Eclipse Temurin)
Phiên bản: JDK 17 LTS
Cài:    chạy file .msi, ✅ TICK "Set JAVA_HOME"
```

```powershell
java -version     # openjdk 17.x.x
```

> Chỉ cần nếu chạy Kafka/Keycloak/KNIME **không qua Docker**.

---

## 6. Chạy Full Project

### Bước 1 — Khởi động Infrastructure (1 lệnh)

```powershell
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

Lệnh này tự động khởi động tất cả: PostgreSQL, TimescaleDB, InfluxDB, Redis, Kafka, Zookeeper, Mosquitto, MinIO, Keycloak, Node-RED.

### Bước 2 — Chạy Backend Services

```powershell
# Terminal 1: API Gateway
cd backend/api-gateway
go run cmd/server/main.go
# → http://localhost:8080

# Terminal 2: (các microservices khác tương tự)
cd backend/aqi-service
go run cmd/server/main.go
```

### Bước 3 — Chạy ML Pipeline (khi cần)

```powershell
cd backend/ml-pipeline
pip install -r requirements.txt
python -m src.training.trainer
```

### Bước 4 — Chạy Frontend

```powershell
cd frontend
npm install --legacy-peer-deps
npm start
# → http://localhost:4200
```

### Bước 5 — Mở trình duyệt

```
Frontend:     http://localhost:4200
API Docs:     http://localhost:8080/swagger/
Keycloak:     http://localhost:8180
Node-RED:     http://localhost:1880
MinIO:        http://localhost:9001
InfluxDB:     http://localhost:8086
Grafana:      http://localhost:3000
```

---

## 8. Biến môi trường cần thiết

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=urbanair
POSTGRES_DB=urbanair

# TimescaleDB (cùng instance PostgreSQL)
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5432

# InfluxDB
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your-token-here
INFLUX_ORG=urbanair
INFLUX_BUCKET=sensor_raw

# Redis
REDIS_URL=localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# MQTT
MQTT_BROKER=tcp://localhost:1883
MQTT_WS=ws://localhost:9001

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Keycloak
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=urbanair
KEYCLOAK_CLIENT_ID=urbanair-api

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRY=24h

# SMTP (Email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# API Gateway
API_PORT=8080
API_ENV=development
```

---

## 9. Yêu cầu phần cứng tối thiểu

| Thành phần | Tối thiểu | Khuyến nghị |
|---|---|---|
| **CPU** | 4 cores | 8 cores |
| **RAM** | 8 GB | 16 GB |
| **Disk** | 20 GB free | 50 GB SSD |
| **OS** | Windows 10 (21H2+) | Windows 11 |
| **WSL2** | Bắt buộc (cho Docker) | — |

> Docker Desktop + toàn bộ containers sử dụng khoảng **4-6 GB RAM** khi chạy đầy đủ.

---

> **Chỉ chạy Frontend thôi?** Chỉ cần cài bước 1-3, sau đó:
> ```
> cd frontend
> npm install --legacy-peer-deps
> npm start
> ```
> Frontend có mock data tích hợp, chạy hoàn toàn độc lập không cần backend.
