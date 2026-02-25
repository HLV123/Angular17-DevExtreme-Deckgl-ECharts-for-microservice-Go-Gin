// ===================== AUTH =====================
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  language: 'vi' | 'en';
  theme: 'dark' | 'light';
  notificationSettings?: NotificationSettings;
}

export type UserRole = 'admin' | 'expert' | 'operator' | 'leader' | 'citizen' | 'partner';

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { accessToken: string; refreshToken: string; user: User; expiresIn: number; }
export interface NotificationSettings { inApp: boolean; email: boolean; sms: boolean; push: boolean; alertLevels: AlertLevel[]; }

// ===================== STATIONS =====================
export interface Station {
  id: string;
  code: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  type: 'fixed' | 'mobile' | 'satellite';
  status: StationStatus;
  managedBy: string;
  installedDate: string;
  mqttTopic: string;
  lastDataAt?: string;
  sensors: Sensor[];
}

export type StationStatus = 'online' | 'offline' | 'maintenance';

export interface Sensor {
  id: string;
  stationId: string;
  type: SensorType;
  model: string;
  serial: string;
  calibrationDate: string;
  nextCalibration: string;
  status: 'active' | 'inactive' | 'error';
  thresholds: SensorThreshold;
}

export type SensorType = 'PM25' | 'PM10' | 'CO' | 'NO2' | 'SO2' | 'O3' | 'Temperature' | 'Humidity' | 'WindSpeed' | 'WindDirection' | 'Pressure';

export interface SensorThreshold { warning: number; critical: number; emergency: number; }

// ===================== AQI =====================
export interface AqiReading {
  stationId: string;
  stationName: string;
  timestamp: string;
  aqi: number;
  aqiLevel: AqiLevel;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
}

export type AqiLevel = 'good' | 'moderate' | 'unhealthy_sg' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AqiHistory {
  stationId: string;
  readings: AqiReading[];
  stats: AqiStats;
}

export interface AqiStats {
  min: number; max: number; mean: number; std: number; p95: number;
}

// ===================== ALERTS =====================
export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  parameter: string;
  value: number;
  threshold: number;
  message: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  notes: AlertNote[];
}

export type AlertType = 'AQI_THRESHOLD' | 'CONNECTION_LOST' | 'SENSOR_ERROR' | 'FORECAST_HIGH' | 'MAINTENANCE_DUE';
export type AlertLevel = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';

export interface AlertNote { id: string; userId: string; userName: string; content: string; createdAt: string; }
export interface AlertConfig { id: string; parameter: string; warningThreshold: number; criticalThreshold: number; emergencyThreshold: number; sustainedMinutes: number; areaType: string; isActive: boolean; }

// ===================== FORECAST =====================
export interface ForecastPoint {
  timestamp: string;
  predicted: number;
  lower95: number;
  upper95: number;
}

export interface ForecastResult {
  stationId: string;
  stationName: string;
  parameter: string;
  horizon: string;
  modelId: string;
  modelName: string;
  generatedAt: string;
  points: ForecastPoint[];
}

export interface MlModel {
  id: string;
  name: string;
  algorithm: string;
  description: string;
  trainedAt: string;
  trainingDataRange: string;
  features: string[];
  metrics: ModelMetrics;
  status: 'active' | 'inactive' | 'training';
  version: string;
}

export interface ModelMetrics { rmse: number; mae: number; r2: number; mape: number; }

// ===================== POLLUTION SOURCES =====================
export interface PollutionSource {
  id: string;
  name: string;
  type: 'industrial' | 'traffic' | 'residential' | 'agriculture' | 'natural';
  subtype: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  operator: string;
  licenseNo?: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  isActive: boolean;
}

// ===================== COMMUNITY =====================
export interface CommunityReport {
  id: string;
  code: string;
  type: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  status: 'new' | 'reviewing' | 'assigned' | 'processing' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  processingNotes: ProcessingNote[];
}

export interface ProcessingNote { id: string; userId: string; userName: string; content: string; createdAt: string; status: string; }

// ===================== REPORT =====================
export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'event' | 'custom';
  generatedAt: string;
  period: string;
  status: 'generating' | 'ready' | 'error';
  downloadUrl?: string;
  format: 'pdf' | 'excel';
  createdBy: string;
}

// ===================== API PARTNER =====================
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scope: 'read' | 'read_write' | 'admin';
  rateLimit: number;
  organization: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

// ===================== SYSTEM =====================
export interface SystemHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  requestsPerSecond: number;
  errorsPerHour: number;
  lastCheck: string;
}

// ===================== AUDIT =====================
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  userAgent?: string;
}

// ===================== MAP =====================
export interface MapAqiGrid {
  latitude: number;
  longitude: number;
  aqi: number;
  weight: number;
}
