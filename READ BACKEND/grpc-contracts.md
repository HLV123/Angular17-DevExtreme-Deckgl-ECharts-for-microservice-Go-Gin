# gRPC Contracts — Urban Air Quality Platform

## Tổng quan

gRPC được sử dụng cho **giao tiếp nội bộ** giữa các microservices. Frontend không gọi gRPC trực tiếp — API Gateway làm proxy REST → gRPC.

```
Frontend (REST/WS) → API Gateway → gRPC → Microservices
```

---

## 1. Proto Files

### common.proto

```protobuf
syntax = "proto3";
package urbanair;

message Empty {}

message Pagination {
  int32 page = 1;
  int32 page_size = 2;
  string sort = 3;
  string order = 4;
}

message PaginationMeta {
  int32 page = 1;
  int32 page_size = 2;
  int64 total = 3;
  int32 total_pages = 4;
}

message TimeRange {
  string from = 1;
  string to = 2;
}

message Coordinate {
  double latitude = 1;
  double longitude = 2;
}
```

### station.proto

```protobuf
syntax = "proto3";
package urbanair.station;
import "common.proto";

service StationService {
  rpc ListStations(ListStationsRequest) returns (ListStationsResponse);
  rpc GetStation(GetStationRequest) returns (Station);
  rpc CreateStation(CreateStationRequest) returns (Station);
  rpc UpdateStation(UpdateStationRequest) returns (Station);
  rpc DeleteStation(GetStationRequest) returns (urbanair.Empty);
  rpc ListSensors(GetStationRequest) returns (ListSensorsResponse);
  rpc StreamStationStatus(urbanair.Empty) returns (stream StationStatus);
}

message ListStationsRequest {
  urbanair.Pagination pagination = 1;
  string district = 2;
  string type = 3;
  string status = 4;
  string search = 5;
}

message ListStationsResponse {
  repeated Station stations = 1;
  urbanair.PaginationMeta meta = 2;
}

message Station {
  string id = 1;
  string code = 2;
  string name = 3;
  string district = 4;
  string address = 5;
  double latitude = 6;
  double longitude = 7;
  string type = 8;
  string status = 9;
  string mqtt_topic = 10;
  string last_data_at = 11;
  int32 sensors_count = 12;
  int32 current_aqi = 13;
}

message Sensor {
  string id = 1;
  string station_id = 2;
  string type = 3;
  string model = 4;
  string serial_number = 5;
  string unit = 6;
  double warning_threshold = 7;
  double critical_threshold = 8;
  string status = 9;
  double last_value = 10;
}

message StationStatus {
  string station_id = 1;
  string status = 2;
  string timestamp = 3;
}

message GetStationRequest { string id = 1; }
message CreateStationRequest {
  string code = 1; string name = 2; string district = 3;
  string address = 4; double latitude = 5; double longitude = 6; string type = 7;
}
message UpdateStationRequest { string id = 1; string name = 2; string status = 3; }
message ListSensorsResponse { repeated Sensor sensors = 1; }
```

### aqi.proto

```protobuf
syntax = "proto3";
package urbanair.aqi;
import "common.proto";

service AqiService {
  rpc GetCurrentAqi(GetCurrentAqiRequest) returns (AqiSnapshot);
  rpc GetStationAqi(GetStationAqiRequest) returns (StationAqiDetail);
  rpc GetHistory(GetHistoryRequest) returns (AqiHistoryResponse);
  rpc StreamAqi(urbanair.Empty) returns (stream AqiReading);
}

message GetCurrentAqiRequest { string district = 1; }
message GetStationAqiRequest { string station_id = 1; }

message AqiSnapshot {
  repeated AqiReading readings = 1;
  int32 city_avg_aqi = 2;
  int32 stations_online = 3;
  string dominant_pollutant = 4;
}

message AqiReading {
  string station_id = 1;
  string station_name = 2;
  int32 aqi = 3;
  string aqi_level = 4;
  double pm25 = 5;
  double pm10 = 6;
  double co = 7;
  double no2 = 8;
  double so2 = 9;
  double o3 = 10;
  double temperature = 11;
  double humidity = 12;
  double wind_speed = 13;
  string timestamp = 14;
}

message StationAqiDetail {
  AqiReading current = 1;
  repeated int32 sparkline_24h = 2;
  string trend_1h = 3;
  string trend_24h = 4;
}

message GetHistoryRequest {
  string station_id = 1;
  urbanair.TimeRange range = 2;
  string interval = 3;
  repeated string parameters = 4;
}

message AqiHistoryResponse {
  repeated HistoryPoint readings = 1;
  map<string, Statistics> statistics = 2;
}

message HistoryPoint {
  string timestamp = 1;
  map<string, double> values = 2;
}

message Statistics {
  double min = 1; double max = 2; double avg = 3; double std = 4; double p95 = 5;
}
```

### alert.proto

```protobuf
syntax = "proto3";
package urbanair.alert;
import "common.proto";

service AlertService {
  rpc ListAlerts(ListAlertsRequest) returns (ListAlertsResponse);
  rpc GetAlert(GetAlertRequest) returns (AlertDetail);
  rpc AssignAlert(AssignAlertRequest) returns (AlertDetail);
  rpc CloseAlert(CloseAlertRequest) returns (AlertDetail);
  rpc GetConfigs(urbanair.Empty) returns (ListAlertConfigsResponse);
  rpc UpdateConfig(UpdateAlertConfigRequest) returns (AlertConfig);
  rpc StreamAlerts(urbanair.Empty) returns (stream Alert);
}

message Alert {
  string id = 1; string station_id = 2; string station_name = 3;
  string type = 4; string level = 5; string parameter = 6;
  double value = 7; double threshold = 8; string unit = 9;
  string status = 10; string assigned_to = 11; string created_at = 12;
}

message AlertDetail {
  Alert alert = 1;
  repeated TimelineEntry timeline = 2;
}

message TimelineEntry {
  string action = 1; string at = 2; string by = 3; string note = 4;
}

message AlertConfig {
  string id = 1; string parameter = 2; string unit = 3;
  double warning_threshold = 4; double critical_threshold = 5; double emergency_threshold = 6;
  int32 sustained_minutes = 7; int32 cooldown_minutes = 8;
}

message ListAlertsRequest {
  urbanair.Pagination pagination = 1;
  string level = 2; string status = 3; string station_id = 4; urbanair.TimeRange range = 5;
}
message ListAlertsResponse { repeated Alert alerts = 1; urbanair.PaginationMeta meta = 2; }
message GetAlertRequest { string id = 1; }
message AssignAlertRequest { string id = 1; string assignee_id = 2; string note = 3; }
message CloseAlertRequest { string id = 1; string resolution = 2; string root_cause = 3; string actions_taken = 4; }
message ListAlertConfigsResponse { repeated AlertConfig configs = 1; }
message UpdateAlertConfigRequest { string id = 1; double warning_threshold = 2; double critical_threshold = 3; int32 sustained_minutes = 4; }
```

### forecast.proto

```protobuf
syntax = "proto3";
package urbanair.forecast;
import "common.proto";

service ForecastService {
  rpc GetPrediction(ForecastRequest) returns (ForecastResponse);
  rpc StreamPrediction(ForecastRequest) returns (stream ForecastPoint);
  rpc ListModels(urbanair.Empty) returns (ListModelsResponse);
  rpc TrainModel(TrainModelRequest) returns (TrainJobResponse);
}

message ForecastRequest { string station_id = 1; string horizon = 2; string model_id = 3; }

message ForecastResponse {
  string model_name = 1;
  repeated ForecastPoint predictions = 2;
  ModelMetrics accuracy = 3;
}

message ForecastPoint {
  string timestamp = 1; int32 aqi = 2; double pm25 = 3;
  int32 confidence_lower = 4; int32 confidence_upper = 5;
}

message ModelMetrics { double rmse = 1; double mae = 2; double r2 = 3; double mape = 4; }

message MLModel {
  string id = 1; string name = 2; string algorithm = 3; string status = 4;
  string trained_at = 5; repeated string features = 6; ModelMetrics metrics = 7;
}

message ListModelsResponse { repeated MLModel models = 1; }
message TrainModelRequest { string algorithm = 1; urbanair.TimeRange data_range = 2; repeated string station_ids = 3; }
message TrainJobResponse { string job_id = 1; string ws_channel = 2; }
```

### analytics.proto

```protobuf
syntax = "proto3";
package urbanair.analytics;
import "common.proto";

service AnalyticsService {
  rpc GetPivotData(PivotRequest) returns (PivotResponse);
  rpc GetCorrelation(CorrelationRequest) returns (CorrelationResponse);
  rpc GetTrends(TrendRequest) returns (TrendResponse);
}

message PivotRequest {
  urbanair.TimeRange range = 1; repeated string station_ids = 2;
  repeated string parameters = 3; string aggregation = 4;
}

message PivotResponse { repeated PivotRow rows = 1; repeated string columns = 2; }
message PivotRow { string label = 1; map<string, double> values = 2; }

message CorrelationRequest { urbanair.TimeRange range = 1; repeated string parameters = 2; }
message CorrelationResponse { repeated CorrelationPair pairs = 1; }
message CorrelationPair { string param_a = 1; string param_b = 2; double coefficient = 3; }

message TrendRequest { string station_id = 1; urbanair.TimeRange range = 2; string parameter = 3; }
message TrendResponse { repeated double trend = 1; repeated double seasonal = 2; repeated double residual = 3; }
```

---

## 2. Service Config

| Service | Address | Timeout | Max Retries | Circuit Breaker |
|---------|---------|---------|-------------|-----------------|
| station-service | localhost:50051 | 5s | 3 | 5 failures / 30s → open 60s |
| aqi-service | localhost:50052 | 10s | 3 | 5 failures / 30s → open 60s |
| alert-service | localhost:50053 | 5s | 3 | 5 failures / 30s → open 60s |
| forecast-service | localhost:50054 | 30s | 2 | 3 failures / 60s → open 120s |
| report-service | localhost:50055 | 60s | 1 | 3 failures / 60s → open 120s |
| community-service | localhost:50056 | 5s | 3 | 5 failures / 30s → open 60s |
| user-service | localhost:50057 | 5s | 3 | 5 failures / 30s → open 60s |
| integration-service | localhost:50058 | 10s | 3 | 5 failures / 30s → open 60s |

---

## 3. Generate Protobuf

```bash
# scripts/generate-proto.sh
protoc --go_out=shared/pb --go_opt=paths=source_relative \
       --go-grpc_out=shared/pb --go-grpc_opt=paths=source_relative \
       shared/proto/*.proto
```
