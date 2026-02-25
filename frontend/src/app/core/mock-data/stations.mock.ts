import { Station, Sensor } from '../models';

const sensorTypes = ['PM25', 'PM10', 'CO', 'NO2', 'SO2', 'O3', 'Temperature', 'Humidity', 'WindSpeed'] as const;

function generateSensors(stationId: string): Sensor[] {
  return sensorTypes.map((type, i) => ({
    id: `${stationId}-sensor-${i + 1}`,
    stationId,
    type: type as any,
    model: type.startsWith('PM') ? 'Plantower PMS7003' : type === 'CO' ? 'Winsen MH-Z19C' : type === 'Temperature' ? 'DHT22' : 'Generic Sensor',
    serial: `SN-${stationId}-${String(i + 1).padStart(3, '0')}`,
    calibrationDate: '2025-01-15',
    nextCalibration: '2025-07-15',
    status: Math.random() > 0.1 ? 'active' : 'inactive' as any,
    thresholds: { warning: 100, critical: 200, emergency: 300 }
  }));
}

export const MOCK_STATIONS: Station[] = [
  { id: 'ST001', code: 'HK-01', name: 'Hoàn Kiếm', address: '1 Tràng Tiền, Hoàn Kiếm', district: 'Hoàn Kiếm', latitude: 21.0285, longitude: 105.8542, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-03-15', mqttTopic: 'hn/station/ST001/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST002', code: 'CG-01', name: 'Cầu Giấy', address: '144 Xuân Thủy, Cầu Giấy', district: 'Cầu Giấy', latitude: 21.0381, longitude: 105.7812, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-03-15', mqttTopic: 'hn/station/ST002/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST003', code: 'LB-01', name: 'Long Biên', address: '45 Ngọc Lâm, Long Biên', district: 'Long Biên', latitude: 21.0485, longitude: 105.8942, type: 'fixed', status: 'offline', managedBy: 'Sở TN&MT HN', installedDate: '2023-04-20', mqttTopic: 'hn/station/ST003/data', lastDataAt: '2025-06-14T08:30:00Z', sensors: [] },
  { id: 'ST004', code: 'TH-01', name: 'Tây Hồ', address: '10 Thanh Niên, Tây Hồ', district: 'Tây Hồ', latitude: 21.0685, longitude: 105.8242, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-03-15', mqttTopic: 'hn/station/ST004/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST005', code: 'DD-01', name: 'Đống Đa', address: '236 Tây Sơn, Đống Đa', district: 'Đống Đa', latitude: 21.0135, longitude: 105.8242, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-05-10', mqttTopic: 'hn/station/ST005/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST006', code: 'HBT-01', name: 'Hai Bà Trưng', address: '25 Bà Triệu, Hai Bà Trưng', district: 'Hai Bà Trưng', latitude: 21.0085, longitude: 105.8542, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-05-10', mqttTopic: 'hn/station/ST006/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST007', code: 'TX-01', name: 'Thanh Xuân', address: '90 Nguyễn Trãi, Thanh Xuân', district: 'Thanh Xuân', latitude: 20.9935, longitude: 105.8142, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-06-01', mqttTopic: 'hn/station/ST007/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST008', code: 'HM-01', name: 'Hoàng Mai', address: '55 Giải Phóng, Hoàng Mai', district: 'Hoàng Mai', latitude: 20.9835, longitude: 105.8542, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-06-01', mqttTopic: 'hn/station/ST008/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST009', code: 'BD-01', name: 'Bắc Từ Liêm', address: '12 Phạm Văn Đồng, BTL', district: 'Bắc Từ Liêm', latitude: 21.0585, longitude: 105.7742, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-07-15', mqttTopic: 'hn/station/ST009/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST010', code: 'NTL-01', name: 'Nam Từ Liêm', address: '88 Mễ Trì, NTL', district: 'Nam Từ Liêm', latitude: 21.0185, longitude: 105.7642, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-07-15', mqttTopic: 'hn/station/ST010/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST011', code: 'HĐ-01', name: 'Hà Đông', address: '1 Quang Trung, Hà Đông', district: 'Hà Đông', latitude: 20.9717, longitude: 105.7777, type: 'fixed', status: 'maintenance', managedBy: 'Sở TN&MT HN', installedDate: '2023-08-01', mqttTopic: 'hn/station/ST011/data', lastDataAt: '2025-06-13T16:00:00Z', sensors: [] },
  { id: 'ST012', code: 'GĐ-01', name: 'Gia Lâm - KCN', address: 'KCN Sài Đồng, Gia Lâm', district: 'Gia Lâm', latitude: 21.0385, longitude: 105.9242, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-08-01', mqttTopic: 'hn/station/ST012/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST013', code: 'SĐ-01', name: 'Sóc Sơn', address: 'TT Sóc Sơn', district: 'Sóc Sơn', latitude: 21.2585, longitude: 105.8442, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-09-01', mqttTopic: 'hn/station/ST013/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST014', code: 'ĐA-01', name: 'Đông Anh', address: 'TT Đông Anh', district: 'Đông Anh', latitude: 21.1385, longitude: 105.8542, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-09-01', mqttTopic: 'hn/station/ST014/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST015', code: 'TL-01', name: 'Thạch Thất', address: 'TT Liên Quan, Thạch Thất', district: 'Thạch Thất', latitude: 21.0185, longitude: 105.5742, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-10-01', mqttTopic: 'hn/station/ST015/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST016', code: 'TĐ-01', name: 'Di động 1 - Nội thành', address: 'Lưu động', district: 'Ba Đình', latitude: 21.0340, longitude: 105.8400, type: 'mobile', status: 'online', managedBy: 'Đội quan trắc', installedDate: '2024-01-01', mqttTopic: 'hn/station/ST016/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST017', code: 'BD-02', name: 'Ba Đình', address: '1 Hoàng Hoa Thám, Ba Đình', district: 'Ba Đình', latitude: 21.0350, longitude: 105.8150, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-03-15', mqttTopic: 'hn/station/ST017/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST018', code: 'TX-02', name: 'Thanh Trì', address: 'Ngọc Hồi, Thanh Trì', district: 'Thanh Trì', latitude: 20.9435, longitude: 105.8642, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-11-01', mqttTopic: 'hn/station/ST018/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST019', code: 'ML-01', name: 'Mê Linh', address: 'TT Chi Đông, Mê Linh', district: 'Mê Linh', latitude: 21.1885, longitude: 105.7542, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2023-12-01', mqttTopic: 'hn/station/ST019/data', lastDataAt: new Date().toISOString(), sensors: [] },
  { id: 'ST020', code: 'ĐM-01', name: 'Đan Phượng', address: 'TT Phùng, Đan Phượng', district: 'Đan Phượng', latitude: 21.0885, longitude: 105.6642, type: 'fixed', status: 'online', managedBy: 'Sở TN&MT HN', installedDate: '2024-01-15', mqttTopic: 'hn/station/ST020/data', lastDataAt: new Date().toISOString(), sensors: [] },
].map(s => ({ ...s, sensors: generateSensors(s.id) })) as Station[];

export function getStationById(id: string): Station | undefined {
  return MOCK_STATIONS.find(s => s.id === id);
}

export const DISTRICTS = [...new Set(MOCK_STATIONS.map(s => s.district))];

export function generateStations(): Station[] {
  return MOCK_STATIONS;
}

