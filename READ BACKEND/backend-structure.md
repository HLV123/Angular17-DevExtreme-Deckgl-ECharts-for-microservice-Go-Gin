# Backend Structure — Urban Air Quality Platform

Kiến trúc **microservice** sử dụng Go, Node-RED, Python, Docker/K8s.

---

## 1. Cấu trúc tổng quan

```
backend/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Makefile
├── README.md
├── .env.example
├── .gitignore
│
├── api-gateway/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── config/
│   │   ├── config.go
│   │   ├── config.yaml
│   │   └── config.prod.yaml
│   ├── internal/
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   ├── logger.go
│   │   │   ├── ratelimit.go
│   │   │   └── recovery.go
│   │   ├── handler/
│   │   │   ├── auth_handler.go
│   │   │   ├── station_handler.go
│   │   │   ├── aqi_handler.go
│   │   │   ├── alert_handler.go
│   │   │   ├── forecast_handler.go
│   │   │   ├── report_handler.go
│   │   │   ├── map_handler.go
│   │   │   ├── community_handler.go
│   │   │   ├── user_handler.go
│   │   │   ├── webhook_handler.go
│   │   │   ├── apikey_handler.go
│   │   │   ├── audit_handler.go
│   │   │   ├── upload_handler.go
│   │   │   └── health_handler.go
│   │   ├── router/
│   │   │   ├── router.go
│   │   │   ├── v1.go
│   │   │   ├── ws.go
│   │   │   └── public.go
│   │   └── websocket/
│   │       ├── hub.go
│   │       ├── client.go
│   │       ├── aqi_ws.go
│   │       ├── alert_ws.go
│   │       ├── station_ws.go
│   │       └── progress_ws.go
│   ├── pkg/
│   │   ├── response/
│   │   │   └── response.go
│   │   ├── validator/
│   │   │   └── validator.go
│   │   └── pagination/
│   │       └── pagination.go
│   └── docs/
│       ├── swagger.json
│       └── swagger.yaml
│
├── station-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── station.go
│   │   │   ├── sensor.go
│   │   │   └── device.go
│   │   ├── repository/
│   │   │   ├── station_repo.go
│   │   │   ├── sensor_repo.go
│   │   │   └── postgres/
│   │   │       ├── station_postgres.go
│   │   │       └── sensor_postgres.go
│   │   ├── service/
│   │   │   ├── station_service.go
│   │   │   └── sensor_service.go
│   │   └── grpc/
│   │       ├── server.go
│   │       └── station_grpc.go
│   └── proto/
│       └── station.proto
│
├── aqi-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── aqi.go
│   │   │   ├── reading.go
│   │   │   └── calculation.go
│   │   ├── repository/
│   │   │   ├── aqi_repo.go
│   │   │   ├── timescale/
│   │   │   │   └── aqi_timescale.go
│   │   │   └── influx/
│   │   │       └── aqi_influx.go
│   │   ├── service/
│   │   │   ├── aqi_service.go
│   │   │   ├── aqi_calculator.go
│   │   │   └── history_service.go
│   │   ├── consumer/
│   │   │   └── kafka_consumer.go
│   │   └── grpc/
│   │       ├── server.go
│   │       └── aqi_grpc.go
│   └── proto/
│       └── aqi.proto
│
├── alert-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── alert.go
│   │   │   ├── alert_config.go
│   │   │   └── notification.go
│   │   ├── repository/
│   │   │   ├── alert_repo.go
│   │   │   └── postgres/
│   │   │       └── alert_postgres.go
│   │   ├── service/
│   │   │   ├── alert_service.go
│   │   │   ├── threshold_evaluator.go
│   │   │   └── notification_service.go
│   │   ├── consumer/
│   │   │   └── kafka_consumer.go
│   │   └── notifier/
│   │       ├── email.go
│   │       ├── sms.go
│   │       ├── webhook.go
│   │       └── push.go
│   └── proto/
│       └── alert.proto
│
├── forecast-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── forecast.go
│   │   │   ├── model.go
│   │   │   └── evaluation.go
│   │   ├── repository/
│   │   │   ├── forecast_repo.go
│   │   │   └── postgres/
│   │   │       └── forecast_postgres.go
│   │   ├── service/
│   │   │   ├── forecast_service.go
│   │   │   └── model_service.go
│   │   └── grpc/
│   │       ├── server.go
│   │       └── forecast_grpc.go
│   └── proto/
│       └── forecast.proto
│
├── report-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   └── report.go
│   │   ├── repository/
│   │   │   └── report_repo.go
│   │   ├── service/
│   │   │   ├── report_service.go
│   │   │   ├── pdf_generator.go
│   │   │   └── excel_generator.go
│   │   ├── scheduler/
│   │   │   └── cron.go
│   │   └── grpc/
│   │       └── analytics_grpc.go
│   └── proto/
│       └── analytics.proto
│
├── community-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── report.go
│   │   │   └── processing_note.go
│   │   ├── repository/
│   │   │   └── community_repo.go
│   │   ├── service/
│   │   │   └── community_service.go
│   │   └── storage/
│   │       └── minio.go
│   └── proto/
│       └── community.proto
│
├── user-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── user.go
│   │   │   ├── role.go
│   │   │   └── permission.go
│   │   ├── repository/
│   │   │   └── user_repo.go
│   │   ├── service/
│   │   │   ├── user_service.go
│   │   │   ├── auth_service.go
│   │   │   └── rbac_service.go
│   │   └── keycloak/
│   │       └── keycloak_client.go
│   └── proto/
│       └── user.proto
│
├── integration-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── domain/
│   │   │   ├── apikey.go
│   │   │   └── webhook.go
│   │   ├── repository/
│   │   │   └── integration_repo.go
│   │   ├── service/
│   │   │   ├── apikey_service.go
│   │   │   ├── webhook_service.go
│   │   │   └── webhook_delivery.go
│   │   └── external/
│   │       ├── openweather.go
│   │       ├── sentinel5p.go
│   │       └── google_traffic.go
│   └── proto/
│       └── integration.proto
│
├── ingest-service/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   └── internal/
│       ├── consumer/
│       │   └── kafka_consumer.go
│       ├── processor/
│       │   ├── validator.go
│       │   ├── enricher.go
│       │   └── writer.go
│       └── importer/
│           ├── csv_importer.go
│           └── excel_importer.go
│
├── ml-pipeline/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── setup.py
│   ├── config/
│   │   └── pipeline.yaml
│   ├── src/
│   │   ├── __init__.py
│   │   ├── data/
│   │   │   ├── __init__.py
│   │   │   ├── fetcher.py
│   │   │   ├── preprocessor.py
│   │   │   └── feature_engineer.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── lstm.py
│   │   │   ├── xgboost_model.py
│   │   │   ├── sarima.py
│   │   │   ├── random_forest.py
│   │   │   └── prophet_model.py
│   │   ├── training/
│   │   │   ├── __init__.py
│   │   │   ├── trainer.py
│   │   │   ├── evaluator.py
│   │   │   └── hyperparameter.py
│   │   ├── inference/
│   │   │   ├── __init__.py
│   │   │   └── predictor.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── aqi_calculator.py
│   │       ├── metrics.py
│   │       └── logger.py
│   ├── notebooks/
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_feature_analysis.ipynb
│   │   ├── 03_model_comparison.ipynb
│   │   └── 04_shap_explainability.ipynb
│   ├── knime/
│   │   ├── etl_daily_pipeline.knwf
│   │   ├── data_quality_check.knwf
│   │   └── batch_retrain.knwf
│   └── orange/
│       ├── aqi_classification.ows
│       └── anomaly_detection.ows
│
├── nodered/
│   ├── Dockerfile
│   ├── settings.js
│   ├── package.json
│   └── flows/
│       ├── mqtt_ingest.json
│       ├── data_validation.json
│       ├── kafka_forward.json
│       ├── heartbeat_monitor.json
│       └── alert_trigger.json
│
├── shared/
│   ├── go.mod
│   ├── go.sum
│   ├── proto/
│   │   ├── common.proto
│   │   ├── station.proto
│   │   ├── aqi.proto
│   │   ├── alert.proto
│   │   ├── forecast.proto
│   │   ├── analytics.proto
│   │   ├── community.proto
│   │   ├── user.proto
│   │   └── integration.proto
│   ├── pb/
│   │   ├── common.pb.go
│   │   ├── station.pb.go
│   │   ├── station_grpc.pb.go
│   │   ├── aqi.pb.go
│   │   ├── aqi_grpc.pb.go
│   │   ├── alert.pb.go
│   │   ├── alert_grpc.pb.go
│   │   ├── forecast.pb.go
│   │   ├── forecast_grpc.pb.go
│   │   ├── analytics.pb.go
│   │   ├── analytics_grpc.pb.go
│   │   ├── community.pb.go
│   │   ├── community_grpc.pb.go
│   │   ├── user.pb.go
│   │   ├── user_grpc.pb.go
│   │   ├── integration.pb.go
│   │   └── integration_grpc.pb.go
│   ├── database/
│   │   ├── postgres.go
│   │   ├── timescale.go
│   │   ├── influx.go
│   │   ├── redis.go
│   │   └── minio.go
│   ├── kafka/
│   │   ├── producer.go
│   │   └── consumer.go
│   ├── mqtt/
│   │   └── client.go
│   ├── logger/
│   │   └── logger.go
│   ├── auth/
│   │   ├── jwt.go
│   │   └── keycloak.go
│   └── config/
│       └── loader.go
│
├── migrations/
│   ├── postgres/
│   │   ├── 001_create_stations.up.sql
│   │   ├── 001_create_stations.down.sql
│   │   ├── 002_create_sensors.up.sql
│   │   ├── 002_create_sensors.down.sql
│   │   ├── 003_create_users_roles.up.sql
│   │   ├── 003_create_users_roles.down.sql
│   │   ├── 004_create_alerts.up.sql
│   │   ├── 004_create_alerts.down.sql
│   │   ├── 005_create_community_reports.up.sql
│   │   ├── 005_create_community_reports.down.sql
│   │   ├── 006_create_api_keys.up.sql
│   │   ├── 006_create_api_keys.down.sql
│   │   ├── 007_create_webhooks.up.sql
│   │   ├── 007_create_webhooks.down.sql
│   │   ├── 008_create_audit_log.up.sql
│   │   ├── 008_create_audit_log.down.sql
│   │   ├── 009_create_reports.up.sql
│   │   ├── 009_create_reports.down.sql
│   │   ├── 010_create_pollution_sources.up.sql
│   │   └── 010_create_pollution_sources.down.sql
│   └── timescale/
│       ├── 001_create_hypertable_aqi.sql
│       ├── 002_create_hypertable_sensor_raw.sql
│       ├── 003_create_continuous_aggregates.sql
│       └── 004_retention_policies.sql
│
├── deployments/
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── api-gateway/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── ingress.yaml
│   │   ├── station-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── aqi-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── alert-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── forecast-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── report-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── community-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── user-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── integration-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── ingest-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── infrastructure/
│   │   │   ├── postgres-statefulset.yaml
│   │   │   ├── timescale-statefulset.yaml
│   │   │   ├── influxdb-statefulset.yaml
│   │   │   ├── redis-deployment.yaml
│   │   │   ├── kafka-statefulset.yaml
│   │   │   ├── zookeeper-statefulset.yaml
│   │   │   ├── mosquitto-deployment.yaml
│   │   │   ├── minio-statefulset.yaml
│   │   │   ├── keycloak-deployment.yaml
│   │   │   └── nodered-deployment.yaml
│   │   ├── monitoring/
│   │   │   ├── prometheus-config.yaml
│   │   │   ├── prometheus-deployment.yaml
│   │   │   ├── grafana-deployment.yaml
│   │   │   └── grafana-dashboards.yaml
│   │   └── secrets/
│   │       ├── db-secret.yaml
│   │       ├── redis-secret.yaml
│   │       ├── jwt-secret.yaml
│   │       └── smtp-secret.yaml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   │       └── .gitkeep
│   └── mosquitto/
│       ├── mosquitto.conf
│       ├── acl.conf
│       └── passwd
│
├── scripts/
│   ├── init-db.sh
│   ├── seed-data.sh
│   ├── run-migrations.sh
│   ├── generate-proto.sh
│   ├── build-all.sh
│   └── test-all.sh
│
└── monitoring/
    ├── grafana/
    │   └── dashboards/
    │       ├── api-gateway.json
    │       ├── aqi-realtime.json
    │       ├── kafka-metrics.json
    │       ├── postgres-metrics.json
    │       └── mqtt-metrics.json
    └── prometheus/
        ├── prometheus.yml
        └── alert-rules.yml
```

---

## 2. Lệnh chạy

### Development (Docker Compose)

```bash
# Khởi chạy toàn bộ hệ thống
docker-compose -f docker-compose.dev.yml up -d

# Chạy migrations
./scripts/run-migrations.sh

# Seed dữ liệu mẫu
./scripts/seed-data.sh

# Generate protobuf
./scripts/generate-proto.sh
```

### Chạy từng service riêng (dev mode)

```bash
# API Gateway
cd api-gateway && go run cmd/server/main.go

# ML Pipeline
cd ml-pipeline && pip install -r requirements.txt && python -m src.training.trainer

# Node-RED
cd nodered && npm install && npm start
```

### Production (Kubernetes)

```bash
# Tạo namespace
kubectl apply -f deployments/k8s/namespace.yaml

# Deploy infrastructure
kubectl apply -f deployments/k8s/infrastructure/

# Deploy services
kubectl apply -f deployments/k8s/api-gateway/
kubectl apply -f deployments/k8s/station-service/
kubectl apply -f deployments/k8s/aqi-service/
# ... các service khác

# Deploy monitoring
kubectl apply -f deployments/k8s/monitoring/
```

---

## 3. Sơ đồ Microservice

```
                            ┌──────────────┐
                            │   Frontend   │
                            │ Angular SPA  │
                            │  :4200       │
                            └──────┬───────┘
                                   │
                          REST / WS / gRPC-Web
                                   │
                            ┌──────▼───────┐
                            │ API Gateway  │
                            │  Go + Gin    │
                            │  :8080       │
                            └──────┬───────┘
                                   │
              ┌────────┬───────┬───┴───┬────────┬────────┐
              │        │       │       │        │        │
        ┌─────▼──┐ ┌───▼──┐ ┌─▼────┐ ┌▼─────┐ ┌▼─────┐ │
        │Station │ │ AQI  │ │Alert │ │Fore- │ │Report│ │
        │Service │ │Svc   │ │Svc   │ │cast  │ │Svc   │ │
        │ :50051 │ │:50052│ │:50053│ │:50054│ │:50055│ │
        └───┬────┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ │
            │         │        │        │        │      │
     ┌──────▼─────────▼────────▼────────▼────────▼──┐   │
     │              Shared Libraries                 │   │
     │  proto/ · database/ · kafka/ · auth/ · mqtt/  │   │
     └───────────────────┬──────────────────────────┘   │
                         │                              │
        ┌────────┬───────┼───────┬──────────┐          │
        │        │       │       │          │          │
   ┌────▼───┐┌───▼──┐┌──▼───┐┌──▼───┐┌─────▼──┐ ┌────▼────┐
   │Postgres││Redis ││Influx││Kafka ││MinIO   │ │Mosquitto│
   │Timescal││:6379 ││:8086 ││:9092 ││:9000   │ │MQTT     │
   │:5432   ││      ││      ││      ││        │ │:1883    │
   └────────┘└──────┘└──────┘└──────┘└────────┘ └────┬────┘
                                                      │
                              ┌─────────┐        ┌────▼────┐
                              │Keycloak │        │Node-RED │
                              │:8180    │        │:1880    │
                              └─────────┘        └─────────┘
              ┌────────┐ ┌────────┐ ┌────────┐
              │Communi-│ │User    │ │Integra-│
              │ty Svc  │ │Service │ │tion Svc│
              │:50056  │ │:50057  │ │:50058  │
              └────────┘ └────────┘ └────────┘
```

---

## 4. Service ↔ Port Mapping

| Service | Port | Giao thức | Mô tả |
|---------|------|-----------|-------|
| api-gateway | 8080 | REST + WS | Entry point duy nhất cho Frontend |
| station-service | 50051 | gRPC | Quản lý trạm & sensor |
| aqi-service | 50052 | gRPC | Thu thập, tính AQI, lịch sử |
| alert-service | 50053 | gRPC | Cảnh báo, ngưỡng, thông báo |
| forecast-service | 50054 | gRPC | Dự báo AI/ML, quản lý model |
| report-service | 50055 | gRPC | Báo cáo, pivot, analytics |
| community-service | 50056 | gRPC | Phản ánh cộng đồng |
| user-service | 50057 | gRPC | Người dùng, RBAC, Keycloak |
| integration-service | 50058 | gRPC | API Keys, Webhooks, đối tác |
| ingest-service | — | Kafka consumer | Đọc Kafka → ghi DB |
| nodered | 1880 | HTTP + MQTT | IoT workflow |
| PostgreSQL + TimescaleDB | 5432 | TCP | Dữ liệu chính + time-series |
| InfluxDB | 8086 | HTTP | Raw sensor data |
| Redis | 6379 | TCP | Cache, pub-sub, session |
| Kafka | 9092 | TCP | Event streaming |
| Mosquitto | 1883 / 9001 | MQTT / WS | IoT broker |
| MinIO | 9000 | S3 API | Lưu file: báo cáo, model |
| Keycloak | 8180 | HTTP | SSO, OAuth2, quản lý user |
| Prometheus | 9090 | HTTP | Metrics collection |
| Grafana | 3000 | HTTP | Dashboard monitoring |

---

## 5. API Gateway → REST Endpoints

```
Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

Stations
GET    /api/v1/stations
POST   /api/v1/stations
GET    /api/v1/stations/{id}
PUT    /api/v1/stations/{id}
DELETE /api/v1/stations/{id}
GET    /api/v1/stations/{id}/sensors

AQI Data
GET    /api/v1/aqi/current
GET    /api/v1/aqi/current/{station_id}
GET    /api/v1/aqi/history?station_id=&from=&to=
POST   /api/v1/data/import

Alerts
GET    /api/v1/alerts
GET    /api/v1/alerts/{id}
POST   /api/v1/alerts/{id}/assign
POST   /api/v1/alerts/{id}/close
GET    /api/v1/alert-configs
PUT    /api/v1/alert-configs/{id}

Forecast
GET    /api/v1/forecast?station_id=&horizon=
GET    /api/v1/models
POST   /api/v1/models/train

Reports
POST   /api/v1/reports/generate
GET    /api/v1/reports/{id}/download
GET    /api/v1/reports/auto/{type}

Map
GET    /api/v1/map/aqi-grid
GET    /api/v1/map/pollution-sources

Community
POST   /api/v1/community/reports
GET    /api/v1/community/reports
GET    /api/v1/community/reports/{code}
PUT    /api/v1/community/reports/{id}/status

Users
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/roles
PUT    /api/v1/roles/{id}/permissions
GET    /api/v1/audit-log

Integration
GET    /api/v1/api-keys
POST   /api/v1/api-keys
GET    /api/v1/webhooks
POST   /api/v1/webhooks
POST   /api/v1/webhooks/{id}/test
GET    /api/v1/webhooks/{id}/deliveries

Public API (API Key auth)
GET    /api/v1/public/aqi/current
GET    /api/v1/public/aqi/history
GET    /api/v1/public/stations
GET    /api/v1/public/forecast

System
GET    /api/v1/system/health
GET    /api/v1/system/config
PUT    /api/v1/system/config
POST   /api/v1/data/upload
```

---

## 6. WebSocket Endpoints

```
WS /ws/aqi-realtime           → Push AQI mỗi phút cho tất cả trạm
WS /ws/alerts-live             → Push cảnh báo mới ngay lập tức
WS /ws/station-status          → Push trạng thái kết nối trạm
WS /ws/map-realtime            → Push marker update cho bản đồ
WS /ws/import-progress/{id}    → Progress bar import jobs
WS /ws/training-progress/{id}  → Progress bar ML training
```

---

## 7. MQTT Topics

```
Subscribe (từ sensor → Mosquitto → Node-RED):
  hn/station/{station_id}/data        → Dữ liệu AQI từ sensor
  hn/station/{station_id}/heartbeat   → Ping kiểm tra kết nối
  hn/station/{station_id}/alert       → Cảnh báo cấp thiết bị

Publish (từ hệ thống → đối tác):
  hn/public/aqi/current               → AQI đã xử lý
  hn/public/alerts/new                → Cảnh báo mới
  hn/station/{station_id}/command     → Lệnh tới thiết bị
```

---

## 8. Kafka Topics

```
sensor-raw-data        → Node-RED produce, Ingest Service consume
aqi-processed          → AQI Service produce, Alert Service consume
alert-events           → Alert Service produce, Notification consume
import-jobs            → API Gateway produce, Ingest Service consume
training-jobs          → API Gateway produce, ML Pipeline consume
webhook-deliveries     → Alert Service produce, Integration Service consume
audit-events           → All services produce, Audit consumer consume
```

---

## 9. gRPC Service Definitions

```protobuf
service StationService {
  rpc ListStations(ListRequest) returns (StationList);
  rpc GetStation(StationId) returns (Station);
  rpc CreateStation(Station) returns (Station);
  rpc GetStationStatus(Empty) returns (stream StationStatus);
  rpc GetRawData(RawDataRequest) returns (stream SensorReading);
}

service AqiService {
  rpc GetCurrentAqi(Empty) returns (AqiSnapshot);
  rpc GetHistory(HistoryRequest) returns (AqiHistoryResponse);
  rpc StreamAqi(Empty) returns (stream AqiReading);
}

service ForecastService {
  rpc GetPrediction(ForecastRequest) returns (ForecastResponse);
  rpc StreamPrediction(ForecastRequest) returns (stream ForecastPoint);
}

service AnalyticsService {
  rpc GetPivotData(PivotRequest) returns (PivotResponse);
  rpc GetCorrelation(CorrelationRequest) returns (CorrelationResponse);
}

service AlertService {
  rpc ListAlerts(AlertFilter) returns (AlertList);
  rpc StreamAlerts(Empty) returns (stream Alert);
}
```

---

## 10. Database Schema tổng quan

### PostgreSQL (dữ liệu nghiệp vụ)

```
stations            → mã, tên, tọa độ, quận, loại, trạng thái
sensors             → station_id FK, loại, model, serial, ngưỡng
users               → email, hash, role_id, đơn vị, trạng thái
roles               → tên, permissions JSON
alerts              → station_id, level, type, value, threshold, status
alert_configs       → parameter, warning, critical, emergency thresholds
community_reports   → code, type, description, lat/lng, status, assigned_to
processing_notes    → report_id FK, user_id, content, timestamp
pollution_sources   → name, type, lat/lng, operator, impact_level
api_keys            → key hash, organization, scope, rate_limit, usage
webhooks            → url, secret, events[], status, failures
webhook_deliveries  → webhook_id, status_code, response_time, payload
reports             → title, type, period, format, file_path, status
audit_log           → user_id, action, resource, details, ip, timestamp
ml_models           → name, algorithm, metrics JSON, status, file_path
forecast_results    → station_id, model_id, horizon, points JSON
system_config       → key, value, updated_by, updated_at
```

### TimescaleDB (hypertable — time-series)

```
aqi_readings        → time, station_id, aqi, pm25, pm10, co, no2, so2, o3
                      temperature, humidity, wind_speed, wind_direction
                    → Hypertable partitioned by time (1 day chunks)
                    → Continuous aggregates: hourly_avg, daily_avg
                    → Retention policy: raw 90 days, hourly 2 years, daily forever
```

### InfluxDB (raw sensor)

```
Measurement: sensor_raw
  Tags:    station_id, sensor_type, sensor_serial
  Fields:  value, unit, quality_flag
  Time:    nanosecond precision
  Retention: 30 days
```

---

## 11. Luồng dữ liệu chính

```
IoT Sensor
    │
    │ MQTT (JSON)
    ▼
Mosquitto Broker (:1883)
    │
    │ subscribe
    ▼
Node-RED (:1880)
    │
    ├── validate format
    ├── detect outliers
    ├── enrich metadata (Redis lookup)
    │
    │ produce
    ▼
Kafka (:9092)
  topic: sensor-raw-data
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
Ingest Service     AQI Service
    │                  │
    │ write raw        │ calculate AQI
    ▼                  ▼
InfluxDB           TimescaleDB
                       │
                       │ produce
                       ▼
                   Kafka topic: aqi-processed
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
         Alert Svc  WS Push   ML Pipeline
              │        │        │
              │        │    train/predict
              ▼        ▼        │
         Notifications  Frontend  │
         (Email/SMS/       │      ▼
          Webhook)         │   MinIO (models)
                           │
                     Angular SPA
```

---

## 12. Tương thích Frontend ↔ Backend

| Frontend Service | Backend Service | Giao thức | Endpoint |
|---|---|---|---|
| `auth.service.ts` | user-service → Keycloak | REST | `/api/v1/auth/*` |
| `station.service.ts` | station-service | REST | `/api/v1/stations/*` |
| `aqi.service.ts` | aqi-service | REST + WS | `/api/v1/aqi/*` + `/ws/aqi-realtime` |
| `alert.service.ts` | alert-service | REST + WS | `/api/v1/alerts/*` + `/ws/alerts-live` |
| `webhook.service.ts` | integration-service | REST | `/api/v1/webhooks/*` |
| `audit.service.ts` | user-service | REST | `/api/v1/audit-log` |
| `export.service.ts` | — (client-side) | — | Không cần backend |
| `mqtt.service.ts` | Mosquitto | MQTT/WS | `ws://host:9001` |
| `upload.service.ts` | ingest-service → MinIO | REST | `/api/v1/data/upload` |
| NgRx Effects | API Gateway | REST | Tất cả endpoints |

**Để kết nối:** sửa `src/environments/environment.ts` và tắt `mock.interceptor.ts` (xem chi tiết trong `frontend-structure.md` mục 4).
