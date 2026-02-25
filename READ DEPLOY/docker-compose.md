# Docker Compose — Urban Air Quality Platform

## docker-compose.dev.yml

```yaml
version: '3.9'

services:

  # ─── DATABASE ───────────────────────────────────────────

  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: urbanair-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: urbanair
      POSTGRES_DB: urbanair
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations/postgres:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  influxdb:
    image: influxdb:2.7
    container_name: urbanair-influxdb
    restart: unless-stopped
    ports:
      - "8086:8086"
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: admin
      DOCKER_INFLUXDB_INIT_PASSWORD: urbanair123
      DOCKER_INFLUXDB_INIT_ORG: urbanair
      DOCKER_INFLUXDB_INIT_BUCKET: sensor_raw
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: urbanair-influx-token
    volumes:
      - influxdb_data:/var/lib/influxdb2
    healthcheck:
      test: ["CMD", "influx", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: urbanair-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── MESSAGE BROKERS ───────────────────────────────────

  zookeeper:
    image: bitnami/zookeeper:latest
    container_name: urbanair-zookeeper
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      ALLOW_ANONYMOUS_LOGIN: "yes"
    volumes:
      - zookeeper_data:/bitnami/zookeeper

  kafka:
    image: bitnami/kafka:latest
    container_name: urbanair-kafka
    restart: unless-stopped
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT
      ALLOW_PLAINTEXT_LISTENER: "yes"
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_DEFAULT_REPLICATION_FACTOR: 1
      KAFKA_LOG_RETENTION_HOURS: 168
    volumes:
      - kafka_data:/bitnami/kafka
    healthcheck:
      test: ["CMD", "kafka-topics.sh", "--bootstrap-server", "localhost:9092", "--list"]
      interval: 30s
      timeout: 10s
      retries: 5

  mosquitto:
    image: eclipse-mosquitto:2
    container_name: urbanair-mosquitto
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./deployments/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - mosquitto_data:/mosquitto/data
      - mosquitto_log:/mosquitto/log
    healthcheck:
      test: ["CMD", "mosquitto_sub", "-t", "$$SYS/#", "-C", "1", "-i", "healthcheck", "-W", "3"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── OBJECT STORAGE ────────────────────────────────────

  minio:
    image: minio/minio
    container_name: urbanair-minio
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── AUTH ──────────────────────────────────────────────

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: urbanair-keycloak
    restart: unless-stopped
    ports:
      - "8180:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: urbanair
    command: start-dev
    depends_on:
      postgres:
        condition: service_healthy

  # ─── IOT WORKFLOW ──────────────────────────────────────

  nodered:
    image: nodered/node-red
    container_name: urbanair-nodered
    restart: unless-stopped
    ports:
      - "1880:1880"
    volumes:
      - nodered_data:/data
      - ./nodered/flows:/data/flows
    depends_on:
      - mosquitto
      - kafka

  # ─── MONITORING ────────────────────────────────────────

  prometheus:
    image: prom/prometheus:latest
    container_name: urbanair-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: urbanair-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

volumes:
  postgres_data:
  influxdb_data:
  redis_data:
  zookeeper_data:
  kafka_data:
  mosquitto_data:
  mosquitto_log:
  minio_data:
  nodered_data:
  prometheus_data:
  grafana_data:
```

---

## mosquitto.conf

```conf
# deployments/mosquitto/mosquitto.conf
listener 1883
listener 9001
protocol websockets

allow_anonymous true

persistence true
persistence_location /mosquitto/data/

log_dest file /mosquitto/log/mosquitto.log
log_type all
```

---

## Lệnh sử dụng

```bash
# Khởi chạy toàn bộ
docker-compose -f docker-compose.dev.yml up -d

# Xem trạng thái
docker-compose -f docker-compose.dev.yml ps

# Xem logs service cụ thể
docker-compose -f docker-compose.dev.yml logs -f kafka

# Dừng toàn bộ
docker-compose -f docker-compose.dev.yml down

# Dừng + xóa data
docker-compose -f docker-compose.dev.yml down -v
```

---

## Port Summary

| Container | Port(s) | URL |
|-----------|---------|-----|
| PostgreSQL + TimescaleDB | 5432 | `psql -h localhost -U postgres` |
| InfluxDB | 8086 | http://localhost:8086 |
| Redis | 6379 | `redis-cli` |
| Kafka | 9092 | — |
| Zookeeper | 2181 | — |
| Mosquitto | 1883, 9001 (WS) | `mosquitto_sub -h localhost` |
| MinIO | 9000, 9001 | http://localhost:9001 |
| Keycloak | 8180 | http://localhost:8180 |
| Node-RED | 1880 | http://localhost:1880 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |
