# Testing Guide — Urban Air Quality Platform

---

## 1. Test Pyramid

```
                    ┌─────┐
                    │ E2E │  5%   Cypress / Playwright
                   ┌┤     ├┐
                   │└─────┘│
                  ┌┤  API  ├┐    20%  Postman / k6
                  │└───────┘│
                 ┌┤  Integ  ├┐   5%   Testcontainers
                 │└─────────┘│
                ┌┤   Unit    ├┐  70%  Jest / Go test / pytest
                │└───────────┘│
                └─────────────┘
```

| Tầng | Framework | Coverage Target |
|------|-----------|----------------|
| Unit | Go `testing` + testify, Jest (Angular), pytest | 80% |
| Integration | Testcontainers (Go), HttpClientTestingModule | 70% |
| API | Postman collections, k6 load test | 100% endpoints |
| E2E | Cypress hoặc Playwright | Critical flows |

---

## 2. Unit Tests

### Go (Backend)

```bash
# Chạy tất cả tests
cd backend/aqi-service && go test ./... -v

# Với coverage
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out

# Chạy test cụ thể
go test -run TestCalculateAqi -v ./internal/service/
```

```go
// internal/service/aqi_calculator_test.go
func TestCalculateAqi_PM25(t *testing.T) {
    tests := []struct {
        name     string
        pm25     float64
        expected int
    }{
        {"Good", 12.0, 50},
        {"Moderate", 35.5, 100},
        {"Unhealthy SG", 55.5, 150},
        {"Unhealthy", 150.5, 200},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := CalculateAqiPM25(tt.pm25)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### Angular (Frontend)

```bash
# Chạy tất cả tests
cd frontend && npx ng test

# Với coverage
npx ng test --code-coverage
# Report: coverage/index.html
```

```typescript
// aqi.service.spec.ts
describe('AqiService', () => {
  let service: AqiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AqiService]
    });
    service = TestBed.inject(AqiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch current AQI', () => {
    service.getCurrentAqi().subscribe(data => {
      expect(data.length).toBe(20);
      expect(data[0].aqi).toBeGreaterThan(0);
    });
    const req = httpMock.expectOne('/api/v1/aqi/current');
    expect(req.request.method).toBe('GET');
    req.flush(mockAqiData);
  });
});
```

### Python (ML Pipeline)

```bash
cd backend/ml-pipeline && pytest -v --cov=src

# Chạy test cụ thể
pytest tests/test_aqi_calculator.py -v
```

```python
# tests/test_aqi_calculator.py
class TestAqiCalculator:
    def test_pm25_good(self):
        assert calculate_aqi_pm25(12.0) == 50

    def test_pm25_moderate(self):
        assert calculate_aqi_pm25(35.5) == 100

    def test_invalid_negative(self):
        with pytest.raises(ValueError):
            calculate_aqi_pm25(-1.0)
```

---

## 3. Integration Tests

### Go + Testcontainers

```go
// Tạo PostgreSQL container cho test
func TestStationRepository_Integration(t *testing.T) {
    ctx := context.Background()
    container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: testcontainers.ContainerRequest{
            Image: "timescale/timescaledb:latest-pg16",
            Env: map[string]string{"POSTGRES_PASSWORD": "test"},
            ExposedPorts: []string{"5432/tcp"},
            WaitingFor: wait.ForListeningPort("5432/tcp"),
        },
        Started: true,
    })
    // ... run migrations, test CRUD operations
}
```

### Angular HttpClient Mock

```typescript
// Dùng HttpClientTestingModule, không cần backend thật
const req = httpMock.expectOne('/api/v1/stations');
req.flush(mockStations);
```

---

## 4. API Tests

### Postman Collection

```
urban-air-api/
├── Auth/
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── Stations/
│   ├── List Stations
│   ├── Get Station Detail
│   ├── Create Station
│   └── Delete Station
├── AQI/
│   ├── Get Current AQI
│   ├── Get Station AQI
│   └── Get History
├── Alerts/
│   ├── List Alerts
│   ├── Assign Alert
│   └── Close Alert
└── ...
```

### k6 Load Test

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:8080/api/v1/aqi/current');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

---

## 5. E2E Tests (Cypress)

```bash
cd frontend && npx cypress open
```

```javascript
// cypress/e2e/dashboard.cy.js
describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('admin');
  });

  it('should display AQI cards', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="aqi-card"]').should('exist');
    cy.get('[data-testid="city-avg-aqi"]').should('contain.text', 'AQI');
  });

  it('should navigate to station detail', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="station-marker"]').first().click();
    cy.url().should('include', '/monitoring/station/');
  });
});
```

---

## 6. Coverage Targets

| Component | Target | Tool |
|-----------|--------|------|
| Go services (unit) | 80% | `go test -cover` |
| Go services (integration) | 70% | Testcontainers |
| Angular components | 75% | Karma + Istanbul |
| Angular services | 90% | Jest |
| Python ML | 70% | pytest-cov |
| API endpoints | 100% | Postman |
| E2E critical flows | 100% | Cypress |

### Critical Flows cần E2E test

```
1. Login → Dashboard → Xem AQI
2. Dashboard → Bản đồ → Click trạm → Xem chi tiết
3. Cảnh báo xuất hiện → Assign → Process → Close
4. Gửi phản ánh CĐ → Tra cứu bằng mã
5. Export Excel/PDF từ DataGrid
6. Admin: CRUD User, CRUD Webhook
```

---

## 7. CI/CD Pipeline

```yaml
# .github/workflows/test.yml
on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres: { image: timescale/timescaledb:latest-pg16 }
      redis: { image: redis:7-alpine }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
      - run: cd backend && ./scripts/test-all.sh
      - run: go tool cover -func=coverage.out

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd frontend && npm ci --legacy-peer-deps
      - run: npx ng test --watch=false --browsers=ChromeHeadless --code-coverage
      - run: npx ng build

  python-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: cd backend/ml-pipeline && pip install -r requirements.txt
      - run: pytest --cov=src --cov-report=xml
```
