import { Alert, AlertConfig } from '../models';

export const MOCK_ALERTS: Alert[] = [
  { id: 'ALT001', stationId: 'ST001', stationName: 'Hoàn Kiếm', timestamp: new Date(Date.now() - 120000).toISOString(), type: 'AQI_THRESHOLD', level: 'critical', status: 'new', parameter: 'PM2.5', value: 142, threshold: 100, message: 'PM2.5 vượt ngưỡng nguy hiểm tại trạm Hoàn Kiếm', notes: [] },
  { id: 'ALT002', stationId: 'ST003', stationName: 'Long Biên', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'CONNECTION_LOST', level: 'warning', status: 'acknowledged', parameter: 'Connection', value: 0, threshold: 1, message: 'Mất kết nối trạm Long Biên > 30 phút', assignedTo: 'Nguyễn Văn A', notes: [{ id: 'N1', userId: 'U2', userName: 'Nguyễn Văn A', content: 'Đang kiểm tra đường truyền', createdAt: new Date(Date.now() - 600000).toISOString() }] },
  { id: 'ALT003', stationId: 'ST004', stationName: 'Tây Hồ', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'AQI_THRESHOLD', level: 'critical', status: 'in_progress', parameter: 'AQI', value: 189, threshold: 150, message: 'AQI mức Xấu tại khu vực Tây Hồ', assignedTo: 'Trần Thị B', notes: [] },
  { id: 'ALT004', stationId: 'ST008', stationName: 'Hoàng Mai', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'AQI_THRESHOLD', level: 'warning', status: 'in_progress', parameter: 'PM10', value: 168, threshold: 100, message: 'PM10 vượt ngưỡng tại Hoàng Mai', assignedTo: 'Lê Văn C', notes: [] },
  { id: 'ALT005', stationId: 'ST012', stationName: 'Gia Lâm - KCN', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'AQI_THRESHOLD', level: 'emergency', status: 'in_progress', parameter: 'AQI', value: 265, threshold: 200, message: 'AQI mức Rất xấu tại KCN Gia Lâm', assignedTo: 'Phạm Văn D', notes: [] },
  { id: 'ALT006', stationId: 'ST011', stationName: 'Hà Đông', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'MAINTENANCE_DUE', level: 'info', status: 'resolved', parameter: 'System', value: 0, threshold: 0, message: 'Đến lịch bảo trì định kỳ trạm Hà Đông', resolvedAt: new Date(Date.now() - 43200000).toISOString(), resolvedBy: 'Admin', resolution: 'Đã tiến hành bảo trì', notes: [] },
  { id: 'ALT007', stationId: 'ST007', stationName: 'Thanh Xuân', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'AQI_THRESHOLD', level: 'warning', status: 'closed', parameter: 'CO', value: 12, threshold: 10, message: 'CO vượt ngưỡng cảnh báo tại Thanh Xuân', resolvedAt: new Date(Date.now() - 100000000).toISOString(), resolution: 'AQI đã trở lại mức bình thường', notes: [] },
  { id: 'ALT008', stationId: 'ST018', stationName: 'Thanh Trì', timestamp: new Date(Date.now() - 259200000).toISOString(), type: 'FORECAST_HIGH', level: 'info', status: 'closed', parameter: 'AQI', value: 180, threshold: 150, message: 'Dự báo AQI tăng cao tại Thanh Trì ngày mai', notes: [] },
  ...Array.from({ length: 92 }, (_, i) => ({
    id: `ALT${String(i + 9).padStart(3, '0')}`,
    stationId: `ST${String((i % 20) + 1).padStart(3, '0')}`,
    stationName: ['Hoàn Kiếm', 'Cầu Giấy', 'Long Biên', 'Tây Hồ', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Hoàng Mai', 'Bắc Từ Liêm', 'Nam Từ Liêm', 'Hà Đông', 'Gia Lâm', 'Sóc Sơn', 'Đông Anh', 'Thạch Thất', 'Di động 1', 'Ba Đình', 'Thanh Trì', 'Mê Linh', 'Đan Phượng'][i % 20],
    timestamp: new Date(Date.now() - (i + 3) * 86400000).toISOString(),
    type: (['AQI_THRESHOLD', 'CONNECTION_LOST', 'SENSOR_ERROR', 'FORECAST_HIGH'] as const)[i % 4],
    level: (['warning', 'critical', 'info', 'emergency'] as const)[i % 4],
    status: (['resolved', 'closed'] as const)[i % 2],
    parameter: ['PM2.5', 'PM10', 'CO', 'AQI', 'NO2'][i % 5],
    value: 100 + Math.round(Math.random() * 200),
    threshold: 100 + (i % 3) * 50,
    message: `Cảnh báo tự động #${i + 9}`,
    resolvedAt: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
    resolution: 'Đã xử lý',
    notes: [],
  })),
];

export const MOCK_ALERT_CONFIGS: AlertConfig[] = [
  { id: 'AC01', parameter: 'PM2.5', warningThreshold: 50, criticalThreshold: 100, emergencyThreshold: 200, sustainedMinutes: 15, areaType: 'urban', isActive: true },
  { id: 'AC02', parameter: 'PM10', warningThreshold: 100, criticalThreshold: 200, emergencyThreshold: 300, sustainedMinutes: 15, areaType: 'urban', isActive: true },
  { id: 'AC03', parameter: 'CO', warningThreshold: 10, criticalThreshold: 15, emergencyThreshold: 25, sustainedMinutes: 30, areaType: 'urban', isActive: true },
  { id: 'AC04', parameter: 'NO2', warningThreshold: 100, criticalThreshold: 200, emergencyThreshold: 400, sustainedMinutes: 60, areaType: 'urban', isActive: true },
  { id: 'AC05', parameter: 'SO2', warningThreshold: 120, criticalThreshold: 200, emergencyThreshold: 350, sustainedMinutes: 60, areaType: 'urban', isActive: true },
  { id: 'AC06', parameter: 'O3', warningThreshold: 120, criticalThreshold: 180, emergencyThreshold: 300, sustainedMinutes: 60, areaType: 'urban', isActive: true },
  { id: 'AC07', parameter: 'AQI', warningThreshold: 100, criticalThreshold: 200, emergencyThreshold: 300, sustainedMinutes: 10, areaType: 'all', isActive: true },
];

export function generateAlerts(): Alert[] {
  return MOCK_ALERTS;
}
