import { ForecastResult, ForecastPoint, MlModel, PollutionSource, CommunityReport, Report, ApiKey, SystemHealth } from '../models';

export function generateForecast(stationId: string, stationName: string, horizon: number = 24): ForecastResult {
  const points: ForecastPoint[] = [];
  const now = new Date();
  let base = 80 + Math.random() * 60;
  for (let i = 0; i < horizon; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    const hourEffect = Math.sin((t.getHours() - 6) * Math.PI / 12) * 25;
    const predicted = Math.round(base + hourEffect + (Math.random() - 0.5) * 15);
    points.push({
      timestamp: t.toISOString(),
      predicted: Math.max(10, predicted),
      lower95: Math.max(5, predicted - 15 - Math.round(Math.random() * 10)),
      upper95: predicted + 15 + Math.round(Math.random() * 10),
    });
  }
  return { stationId, stationName, parameter: 'AQI', horizon: `${horizon}h`, modelId: 'M001', modelName: 'LSTM v3', generatedAt: now.toISOString(), points };
}

export const MOCK_ML_MODELS: MlModel[] = [
  { id: 'M001', name: 'LSTM AQI Predictor v3', algorithm: 'LSTM', description: 'Mô hình LSTM 3 lớp cho dự báo AQI', trainedAt: '2025-06-10', trainingDataRange: '2024-01 → 2025-06', features: ['PM2.5', 'PM10', 'Temperature', 'Humidity', 'WindSpeed', 'Hour', 'DayOfWeek'], metrics: { rmse: 12.3, mae: 9.1, r2: 0.87, mape: 8.5 }, status: 'active', version: '3.0.1' },
  { id: 'M002', name: 'XGBoost Short-term', algorithm: 'XGBoost', description: 'XGBoost cho dự báo ngắn hạn 6h', trainedAt: '2025-06-08', trainingDataRange: '2024-06 → 2025-06', features: ['PM2.5', 'PM10', 'CO', 'NO2', 'Temperature', 'Humidity', 'Hour'], metrics: { rmse: 15.1, mae: 11.2, r2: 0.82, mape: 10.3 }, status: 'active', version: '2.1.0' },
  { id: 'M003', name: 'SARIMA Seasonal', algorithm: 'SARIMA', description: 'SARIMA cho phát hiện pattern theo mùa', trainedAt: '2025-05-20', trainingDataRange: '2023-01 → 2025-05', features: ['AQI', 'Season', 'DayOfWeek', 'Holiday'], metrics: { rmse: 18.5, mae: 14.2, r2: 0.76, mape: 13.1 }, status: 'active', version: '1.2.0' },
  { id: 'M004', name: 'Random Forest Ensemble', algorithm: 'Random Forest', description: 'Ensemble RF cho multi-step forecast', trainedAt: '2025-06-01', trainingDataRange: '2024-01 → 2025-06', features: ['PM2.5', 'PM10', 'CO', 'NO2', 'SO2', 'O3', 'Weather'], metrics: { rmse: 16.8, mae: 12.5, r2: 0.79, mape: 11.8 }, status: 'inactive', version: '1.0.0' },
  { id: 'M005', name: 'Prophet AQI Forecast', algorithm: 'Prophet', description: 'Facebook Prophet cho trend + seasonality', trainedAt: '2025-05-15', trainingDataRange: '2023-06 → 2025-05', features: ['AQI', 'Holiday', 'Events'], metrics: { rmse: 20.1, mae: 15.8, r2: 0.72, mape: 14.5 }, status: 'active', version: '1.1.0' },
];

export const MOCK_POLLUTION_SOURCES: PollutionSource[] = [
  { id: 'PS001', name: 'KCN Sài Đồng', type: 'industrial', subtype: 'Khu công nghiệp', address: 'Sài Đồng, Gia Lâm', district: 'Gia Lâm', latitude: 21.035, longitude: 105.920, operator: 'BQL KCN Hà Nội', licenseNo: 'GP-2020-001', impactLevel: 'high', description: 'KCN đa ngành, 120 doanh nghiệp', isActive: true },
  { id: 'PS002', name: 'Ngã tư Nguyễn Trãi - Khuất Duy Tiến', type: 'traffic', subtype: 'Nút giao thông', address: 'Ngã tư NT-KDT', district: 'Thanh Xuân', latitude: 21.001, longitude: 105.812, operator: 'Sở GTVT HN', impactLevel: 'high', description: 'Nút giao thông lớn, ùn tắc giờ cao điểm', isActive: true },
  { id: 'PS003', name: 'Bãi rác Nam Sơn', type: 'residential', subtype: 'Bãi rác', address: 'Nam Sơn, Sóc Sơn', district: 'Sóc Sơn', latitude: 21.228, longitude: 105.850, operator: 'URENCO Hà Nội', impactLevel: 'critical', description: 'Bãi chôn lấp rác thải lớn nhất HN', isActive: true },
  { id: 'PS004', name: 'Vùng đốt rơm rạ Gia Lâm', type: 'agriculture', subtype: 'Đốt rơm rạ', address: 'Gia Lâm', district: 'Gia Lâm', latitude: 21.050, longitude: 105.940, operator: '', impactLevel: 'medium', description: 'Đốt rơm rạ theo mùa (tháng 5-6, 10-11)', isActive: false },
  { id: 'PS005', name: 'Nhà máy Xi măng Sài Sơn', type: 'industrial', subtype: 'Nhà máy', address: 'Sài Sơn, Quốc Oai', district: 'Quốc Oai', latitude: 20.990, longitude: 105.620, operator: 'Cty CP Xi măng Sài Sơn', licenseNo: 'GP-2019-045', impactLevel: 'medium', description: 'Nhà máy xi măng công suất 500K tấn/năm', isActive: true },
  { id: 'PS006', name: 'Cầu Thanh Trì', type: 'traffic', subtype: 'Cao tốc', address: 'Cầu Thanh Trì', district: 'Thanh Trì', latitude: 20.975, longitude: 105.880, operator: 'VEC', impactLevel: 'medium', description: 'Tuyến cao tốc, lưu lượng xe tải cao', isActive: true },
];

export function generatePollutionSources(): PollutionSource[] {
  return MOCK_POLLUTION_SOURCES;
}

export const MOCK_COMMUNITY_REPORTS: CommunityReport[] = [
  { id: 'CR001', code: 'UA-2025-001', type: 'Ô nhiễm khói bụi', description: 'Khói đen từ nhà máy gần khu dân cư', address: '45 Nguyễn Trãi, Thanh Xuân', latitude: 20.998, longitude: 105.815, images: [], reporterName: 'Nguyễn Văn X', reporterEmail: 'x@gmail.com', isAnonymous: false, status: 'processing', assignedTo: 'Lê Vận Hành', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString(), processingNotes: [{ id: 'PN1', userId: 'U003', userName: 'Lê Vận Hành', content: 'Đã xác nhận hiện tượng, đang phối hợp kiểm tra', createdAt: new Date(Date.now() - 43200000).toISOString(), status: 'processing' }] },
  { id: 'CR002', code: 'UA-2025-002', type: 'Đốt rác tự phát', description: 'Đốt rác thải tại bãi đất trống cuối đường', address: '12 Lạc Long Quân, Tây Hồ', latitude: 21.065, longitude: 105.830, images: [], isAnonymous: true, status: 'assigned', assignedTo: 'Nguyễn Văn A', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), processingNotes: [] },
  { id: 'CR003', code: 'UA-2025-003', type: 'Mùi hôi thối', description: 'Mùi hôi thối từ cống thoát nước', address: '88 Trần Duy Hưng, Cầu Giấy', latitude: 21.020, longitude: 105.790, images: [], reporterName: 'Trần Thị Y', reporterPhone: '0987654321', isAnonymous: false, status: 'resolved', createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString(), processingNotes: [{ id: 'PN2', userId: 'U003', userName: 'Lê Vận Hành', content: 'Đã xử lý, nạo vét cống thoát nước', createdAt: new Date(Date.now() - 259200000).toISOString(), status: 'resolved' }] },
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `CR${String(i + 4).padStart(3, '0')}`,
    code: `UA-2025-${String(i + 4).padStart(3, '0')}`,
    type: ['Ô nhiễm khói bụi', 'Đốt rác tự phát', 'Mùi hôi thối', 'Tiếng ồn', 'Nước thải'][i % 5],
    description: `Phản ánh cộng đồng #${i + 4}`,
    address: `Địa chỉ ${i + 4}, Hà Nội`,
    latitude: 20.95 + Math.random() * 0.2,
    longitude: 105.7 + Math.random() * 0.3,
    images: [],
    isAnonymous: i % 3 === 0,
    status: (['new', 'reviewing', 'assigned', 'processing', 'resolved', 'closed'] as const)[i % 6],
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    processingNotes: [],
  })),
];

export const MOCK_REPORTS: Report[] = [
  { id: 'R001', title: 'Báo cáo AQI ngày 14/06/2025', type: 'daily', generatedAt: '2025-06-14T07:00:00Z', period: '2025-06-13', status: 'ready', format: 'pdf', createdBy: 'Hệ thống' },
  { id: 'R002', title: 'Báo cáo tuần 24/2025', type: 'weekly', generatedAt: '2025-06-09T07:00:00Z', period: '2025-W24', status: 'ready', format: 'pdf', createdBy: 'Hệ thống' },
  { id: 'R003', title: 'Báo cáo tháng 05/2025', type: 'monthly', generatedAt: '2025-06-01T07:00:00Z', period: '2025-05', status: 'ready', format: 'pdf', createdBy: 'Hệ thống' },
  { id: 'R004', title: 'Báo cáo quý 1/2025', type: 'quarterly', generatedAt: '2025-04-01T07:00:00Z', period: '2025-Q1', status: 'ready', format: 'excel', createdBy: 'Trần Chuyên Gia' },
  { id: 'R005', title: 'Sự kiện AQI vượt ngưỡng KCN Gia Lâm', type: 'event', generatedAt: '2025-06-12T14:00:00Z', period: '2025-06-12', status: 'ready', format: 'pdf', createdBy: 'Hệ thống' },
];

export function generateReportList(): Report[] {
  return MOCK_REPORTS;
}

export const MOCK_API_KEYS: ApiKey[] = [
  { id: 'AK001', name: 'VnExpress Weather Widget', key: 'ua_pk_live_abc123def456', scope: 'read', rateLimit: 1000, organization: 'VnExpress', isActive: true, createdAt: '2024-06-01', lastUsedAt: new Date().toISOString(), usageCount: 45230 },
  { id: 'AK002', name: 'Hanoi Smart City Portal', key: 'ua_pk_live_ghi789jkl012', scope: 'read_write', rateLimit: 5000, organization: 'UBND TP Hà Nội', isActive: true, createdAt: '2024-03-15', lastUsedAt: new Date(Date.now() - 3600000).toISOString(), usageCount: 128500 },
  { id: 'AK003', name: 'Research Lab - ĐHBKHN', key: 'ua_pk_test_mno345pqr678', scope: 'read', rateLimit: 500, organization: 'ĐH Bách khoa HN', isActive: true, createdAt: '2025-01-10', lastUsedAt: new Date(Date.now() - 86400000).toISOString(), usageCount: 8900 },
];

export const MOCK_SYSTEM_HEALTH: SystemHealth[] = [
  { serviceName: 'API Gateway (Go/Gin)', status: 'healthy', uptime: '45d 12h', cpu: 23, memory: 45, disk: 32, latencyP50: 12, latencyP95: 45, latencyP99: 120, requestsPerSecond: 342, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'PostgreSQL + TimescaleDB', status: 'healthy', uptime: '60d 5h', cpu: 35, memory: 62, disk: 58, latencyP50: 5, latencyP95: 25, latencyP99: 80, requestsPerSecond: 890, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'InfluxDB', status: 'healthy', uptime: '60d 5h', cpu: 18, memory: 40, disk: 45, latencyP50: 3, latencyP95: 15, latencyP99: 45, requestsPerSecond: 1200, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'Redis Cache', status: 'healthy', uptime: '60d 5h', cpu: 8, memory: 25, disk: 12, latencyP50: 1, latencyP95: 3, latencyP99: 8, requestsPerSecond: 5600, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'Mosquitto MQTT', status: 'healthy', uptime: '30d 8h', cpu: 12, memory: 18, disk: 5, latencyP50: 2, latencyP95: 8, latencyP99: 20, requestsPerSecond: 2400, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'Apache Kafka', status: 'healthy', uptime: '45d 12h', cpu: 28, memory: 55, disk: 40, latencyP50: 4, latencyP95: 18, latencyP99: 50, requestsPerSecond: 3200, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'Node-RED', status: 'healthy', uptime: '15d 3h', cpu: 15, memory: 30, disk: 8, latencyP50: 8, latencyP95: 30, latencyP99: 90, requestsPerSecond: 450, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'KNIME Server', status: 'degraded', uptime: '10d 1h', cpu: 72, memory: 85, disk: 65, latencyP50: 200, latencyP95: 800, latencyP99: 2000, requestsPerSecond: 15, errorsPerHour: 23, lastCheck: new Date().toISOString() },
  { serviceName: 'Keycloak', status: 'healthy', uptime: '60d 5h', cpu: 10, memory: 35, disk: 15, latencyP50: 15, latencyP95: 50, latencyP99: 150, requestsPerSecond: 120, errorsPerHour: 0, lastCheck: new Date().toISOString() },
  { serviceName: 'MinIO Storage', status: 'healthy', uptime: '60d 5h', cpu: 5, memory: 15, disk: 72, latencyP50: 10, latencyP95: 40, latencyP99: 100, requestsPerSecond: 80, errorsPerHour: 0, lastCheck: new Date().toISOString() },
];

export function generateSystemHealth(): SystemHealth[] {
  return MOCK_SYSTEM_HEALTH;
}
