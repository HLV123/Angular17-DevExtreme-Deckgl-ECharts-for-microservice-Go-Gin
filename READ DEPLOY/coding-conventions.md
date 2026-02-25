# Coding Conventions — Urban Air Quality Platform

---

## 1. Go (Backend Services)

### Cấu trúc package

```
service-name/
├── cmd/server/main.go          # Entrypoint
├── internal/                    # Private code
│   ├── domain/                  # Entities, value objects
│   ├── repository/              # Data access interface + implementation
│   ├── service/                 # Business logic
│   ├── handler/ hoặc grpc/      # Transport layer
│   └── consumer/                # Kafka consumers
├── pkg/                         # Shared utilities (exportable)
└── proto/                       # Protobuf definitions
```

### Naming

```go
// File: snake_case.go
station_service.go, kafka_consumer.go

// Struct/Interface: PascalCase
type Station struct{}
type StationRepository interface{}

// Function: PascalCase (exported), camelCase (private)
func GetStation() {}
func calculateAqi() {}

// Variable/const: camelCase (local), PascalCase (exported)
var stationCount int
const MaxRetries = 3
```

### Error handling

```go
// Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to get station %s: %w", id, err)
}

// Custom error types
type NotFoundError struct { Resource, ID string }
func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s not found: %s", e.Resource, e.ID)
}
```

### Logging — slog (structured)

```go
slog.Info("station updated", "station_id", id, "field", "status", "new_value", "online")
slog.Error("kafka produce failed", "topic", "aqi-processed", "error", err)
```

---

## 2. Angular / TypeScript (Frontend)

### Naming

```typescript
// File: kebab-case.component.ts, kebab-case.service.ts
station-list.component.ts, aqi.service.ts

// Class: PascalCase
export class StationListComponent {}
export class AqiService {}

// Interface/Type: PascalCase, prefix I optional
export interface Station {}
export type AqiLevel = 'good' | 'moderate' | 'unhealthy';

// Variable/function: camelCase
const stationCount = 20;
function calculateAqi() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY = 3;
const API_BASE_URL = '/api/v1';

// Observable: suffix $
stations$: Observable<Station[]>;
currentAqi$: Observable<number>;
```

### Component pattern (Standalone)

```typescript
@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  template: `...`,
  styles: [`...`]
})
export class StationListComponent implements OnInit, OnDestroy {}
```

### Style guide

```
- 1 component = 1 file (template + style inline hoặc tách riêng nếu > 50 lines)
- Smart component (container) vs Dumb component (presentational)
- Sử dụng Signals cho local state, NgRx cho global state
- Unsubscribe trong OnDestroy hoặc dùng takeUntilDestroyed()
- Không dùng any — khai báo type/interface đầy đủ
```

---

## 3. Python (ML Pipeline)

### Naming

```python
# File: snake_case.py
feature_engineer.py, lstm_model.py

# Class: PascalCase
class LSTMPredictor:

# Function/variable: snake_case
def calculate_aqi():
station_count = 20

# Constant: UPPER_SNAKE_CASE
MAX_EPOCHS = 100
LEARNING_RATE = 0.001
```

### Docstring

```python
def train_model(data: pd.DataFrame, params: dict) -> MLModel:
    """Train a forecasting model with given data and hyperparameters.
    
    Args:
        data: Training DataFrame with columns [timestamp, pm25, pm10, ...]
        params: Hyperparameters dict with keys: epochs, batch_size, lr
    
    Returns:
        Trained MLModel instance with metrics populated.
    
    Raises:
        ValueError: If data has fewer than 1000 rows.
    """
```

---

## 4. Git Conventions

### Branch naming

```
main                              Production
develop                           Development integration
feature/add-webhook-management    New feature
bugfix/fix-aqi-calculation        Bug fix
hotfix/critical-alert-failure     Production hotfix
release/v1.2.0                    Release preparation
```

### Commit message (Conventional Commits)

```
<type>(<scope>): <subject>

feat(station): add CRUD endpoints for station management
fix(alert): correct threshold comparison logic
docs(api): update API contracts for webhook endpoints
refactor(aqi): extract AQI calculator to separate service
test(forecast): add unit tests for LSTM predictor
chore(deps): upgrade go modules to latest versions
perf(query): add composite index for aqi_readings lookup
```

### PR Checklist

```
[ ] Code compiles / builds without errors
[ ] Unit tests pass
[ ] New code has tests (coverage >= 80%)
[ ] API changes documented in api-contracts.md
[ ] Database changes have migration files
[ ] Proto changes regenerated with generate-proto.sh
[ ] No hardcoded secrets or credentials
[ ] Error handling covers edge cases
[ ] Logging follows structured format
[ ] README/docs updated if needed
```

---

## 5. API Design

```
- RESTful naming: plural nouns, no verbs
  ✅ GET /stations       ❌ GET /getStations
  ✅ POST /stations      ❌ POST /createStation

- Nested resources max 2 levels
  ✅ /stations/{id}/sensors
  ❌ /stations/{id}/sensors/{sid}/readings

- Query params for filtering, body for create/update
  ✅ GET /alerts?level=critical&status=active
  ✅ POST /alerts/{id}/close  { "resolution": "..." }

- Always return { success, data, error, meta }
- Timestamps: ISO 8601 with timezone (2025-02-25T14:30:00+07:00)
- IDs: human-readable prefixes (ST-001, ALT-001, usr_001)
```

---

## 6. Database

```
- Table names: snake_case, plural (stations, alert_configs)
- Column names: snake_case (station_id, created_at)
- Primary key: VARCHAR with prefix or SERIAL/BIGSERIAL
- Timestamps: TIMESTAMPTZ (always with timezone)
- JSON data: JSONB (not JSON)
- Indexes: idx_{table}_{column}
- Foreign keys: {referenced_table}_id
- Boolean: never nullable, always DEFAULT
- Soft delete: không dùng — dùng status field thay thế
```
