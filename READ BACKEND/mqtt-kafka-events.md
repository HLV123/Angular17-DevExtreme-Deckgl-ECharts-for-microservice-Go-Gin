# MQTT & Kafka Events — Urban Air Quality Platform

---

## 1. MQTT Topics

### Sensor → Mosquitto (inbound)

| Topic Pattern | Publisher | Payload | QoS | Retain |
|---|---|---|---|---|
| `hn/station/{station_id}/data` | Sensor | AQI readings JSON | 1 | false |
| `hn/station/{station_id}/heartbeat` | Sensor | Heartbeat ping | 0 | false |
| `hn/station/{station_id}/alert` | Sensor | Device-level alert | 1 | false |

### System → Sensor (outbound)

| Topic Pattern | Publisher | Payload | QoS | Retain |
|---|---|---|---|---|
| `hn/station/{station_id}/command` | Go / Node-RED | Control command | 1 | false |
| `hn/public/aqi/current` | Go service | Processed AQI | 1 | true |
| `hn/public/alerts/new` | Alert service | New alert | 1 | false |

### MQTT Payload: sensor_data

```json
{
  "station_id": "ST-001",
  "timestamp": "2025-02-25T14:30:00+07:00",
  "sensors": [
    { "type": "PM2.5", "value": 35.2, "unit": "µg/m³", "serial": "SDS-20230615-001" },
    { "type": "PM10", "value": 68.0, "unit": "µg/m³", "serial": "SDS-20230615-002" },
    { "type": "CO", "value": 1.2, "unit": "mg/m³", "serial": "MQ7-20230615-001" },
    { "type": "NO2", "value": 28.5, "unit": "µg/m³", "serial": "MC-20230615-001" },
    { "type": "SO2", "value": 12.0, "unit": "µg/m³", "serial": "MC-20230615-002" },
    { "type": "O3", "value": 45.0, "unit": "µg/m³", "serial": "MQ131-20230615-001" },
    { "type": "temperature", "value": 28.5, "unit": "°C" },
    { "type": "humidity", "value": 72.0, "unit": "%" },
    { "type": "wind_speed", "value": 3.2, "unit": "m/s" },
    { "type": "wind_direction", "value": 180, "unit": "°" }
  ]
}
```

### MQTT Payload: heartbeat

```json
{
  "station_id": "ST-001",
  "timestamp": "2025-02-25T14:30:00+07:00",
  "uptime_seconds": 864000,
  "firmware_version": "2.1.3",
  "battery_level": null,
  "signal_strength": -65
}
```

### MQTT Payload: command

```json
{
  "command": "reset",
  "target": "sensor",
  "sensor_serial": "SDS-20230615-001",
  "issued_by": "admin",
  "timestamp": "2025-02-25T14:30:00+07:00"
}
```

---

## 2. Kafka Topics

### Topic List

| Topic | Partitions | Replication | Retention | Producer | Consumer |
|---|---|---|---|---|---|
| `sensor-raw-data` | 6 | 1 (dev) / 3 (prod) | 7 days | Node-RED | Ingest Service, AQI Service |
| `aqi-processed` | 3 | 1 / 3 | 7 days | AQI Service | Alert Service, WebSocket Hub |
| `alert-events` | 3 | 1 / 3 | 30 days | Alert Service | Notification Service, WebSocket Hub |
| `import-jobs` | 1 | 1 / 3 | 1 day | API Gateway | Ingest Service |
| `training-jobs` | 1 | 1 / 3 | 1 day | API Gateway | ML Pipeline |
| `webhook-deliveries` | 3 | 1 / 3 | 7 days | Alert Service | Integration Service |
| `audit-events` | 3 | 1 / 3 | 90 days | All services | Audit Consumer |
| `station-status` | 3 | 1 / 3 | 1 day | Node-RED | Station Service, WebSocket Hub |

### Partition Strategy

```
sensor-raw-data    → partition by: station_id (hash)
                     → cùng station luôn vào cùng partition → đảm bảo ordering
aqi-processed      → partition by: station_id (hash)
alert-events       → partition by: alert level (round-robin cho emergency)
webhook-deliveries → partition by: webhook_id (hash)
audit-events       → partition by: user_id (hash)
station-status     → partition by: station_id (hash)
```

### Dead Letter Queue (DLQ)

```
Mỗi topic có DLQ tương ứng:
  sensor-raw-data.DLQ
  aqi-processed.DLQ
  alert-events.DLQ
  webhook-deliveries.DLQ

Policy:
  - Max retries: 3
  - Retry delay: 1s → 5s → 30s (exponential backoff)
  - Nếu fail 3 lần → chuyển vào DLQ
  - DLQ retention: 30 days
  - Alert khi DLQ > 100 messages
```

### Kafka Payload: sensor-raw-data

```json
{
  "key": "ST-001",
  "headers": {
    "source": "nodered",
    "version": "1.0",
    "content-type": "application/json"
  },
  "value": {
    "station_id": "ST-001",
    "timestamp": "2025-02-25T14:30:00+07:00",
    "validated": true,
    "enriched": {
      "station_name": "Trạm Hoàn Kiếm",
      "district": "Hoàn Kiếm"
    },
    "readings": [
      { "type": "PM2.5", "value": 35.2, "unit": "µg/m³", "quality": "valid" },
      { "type": "PM10", "value": 68.0, "unit": "µg/m³", "quality": "valid" }
    ]
  }
}
```

### Kafka Payload: aqi-processed

```json
{
  "key": "ST-001",
  "value": {
    "station_id": "ST-001",
    "timestamp": "2025-02-25T14:30:00+07:00",
    "aqi": 85,
    "aqi_level": "moderate",
    "dominant_pollutant": "PM2.5",
    "sub_indices": {
      "pm25": { "value": 35.2, "aqi": 85 },
      "pm10": { "value": 68.0, "aqi": 57 },
      "co": { "value": 1.2, "aqi": 14 }
    }
  }
}
```

### Kafka Payload: alert-events

```json
{
  "key": "ALT-001",
  "value": {
    "event_type": "alert.created",
    "alert_id": "ALT-001",
    "station_id": "ST-003",
    "station_name": "Trạm Hai Bà Trưng",
    "level": "critical",
    "parameter": "PM2.5",
    "value": 152.0,
    "threshold": 100.0,
    "timestamp": "2025-02-25T08:15:00+07:00",
    "notify_channels": ["websocket", "email", "sms"]
  }
}
```

### Kafka Payload: webhook-deliveries

```json
{
  "key": "wh_001",
  "value": {
    "webhook_id": "wh_001",
    "url": "https://partner-a.com/api/webhook",
    "event": "alert.new",
    "payload": { "alertId": "ALT-001", "level": "critical" },
    "attempt": 1,
    "max_retries": 3
  }
}
```

### Kafka Payload: audit-events

```json
{
  "key": "usr_001",
  "value": {
    "user_id": "usr_001",
    "user_name": "admin",
    "action": "UPDATE",
    "resource": "station",
    "resource_id": "ST-001",
    "details": { "field": "status", "old": "online", "new": "maintenance" },
    "ip": "192.168.1.100",
    "timestamp": "2025-02-25T14:30:00+07:00"
  }
}
```

---

## 3. Luồng Message tổng thể

```
Sensor Device
    │
    │ MQTT QoS 1
    ▼
Mosquitto (:1883)
    │
    │ subscribe: hn/station/+/data
    ▼
Node-RED (:1880)
    │
    ├── 1. Validate JSON schema
    ├── 2. Check value ranges (outlier reject)
    ├── 3. Enrich: lookup station metadata (Redis)
    ├── 4. Forward heartbeat → Kafka topic: station-status
    │
    │ Kafka produce
    ▼
Kafka topic: sensor-raw-data
    │
    ├────────────────────────────────┐
    │                                │
    ▼                                ▼
Ingest Service                    AQI Service
    │                                │
    │ Write raw                      │ Calculate AQI (QCVN 05:2023)
    ▼                                │
InfluxDB                            │ Kafka produce
                                     ▼
                              Kafka topic: aqi-processed
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              Alert Service    WebSocket Hub     TimescaleDB
                    │                │
                    │ evaluate       │ push to
                    │ thresholds     │ frontend
                    ▼                ▼
              Kafka topic:      Angular SPA
              alert-events
                    │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
      Email     SMS       Webhook
     (SMTP)   (Gateway)  (HTTP POST)
```

---

## 4. Node-RED Flow Pipeline

```
[MQTT In] → [JSON Parse] → [Schema Validate] → [Range Check]
                                                      │
                                            ┌─────────┤
                                            │    PASS  │  FAIL
                                            │         │
                                            ▼         ▼
                                    [Redis Enrich]  [Log Error]
                                            │
                                            ▼
                                  [Kafka Producer]
                                  topic: sensor-raw-data

[MQTT In: heartbeat] → [Extract station_id] → [Kafka Producer: station-status]
                                               → [Check timeout 5min]
                                                        │  TIMEOUT
                                                        ▼
                                               [Kafka Producer: alert-events]
                                               type: connection_lost
```
