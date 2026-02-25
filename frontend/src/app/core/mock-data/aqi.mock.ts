import { AqiReading, AqiLevel, AqiHistory, AqiStats } from '../models';
import { MOCK_STATIONS } from './stations.mock';

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function getAqiLevel(aqi: number): AqiLevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sg';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

function generateAqiForStation(stationId: string, stationName: string, baseAqi: number): AqiReading {
  const aqi = Math.max(10, Math.min(400, baseAqi + randomBetween(-20, 20)));
  const pm25 = aqi * randomBetween(0.4, 0.7);
  const pm10 = pm25 * randomBetween(1.2, 1.8);
  return {
    stationId,
    stationName,
    timestamp: new Date().toISOString(),
    aqi: Math.round(aqi),
    aqiLevel: getAqiLevel(aqi),
    pm25: Math.round(pm25 * 10) / 10,
    pm10: Math.round(pm10 * 10) / 10,
    co: randomBetween(0.5, 12),
    no2: randomBetween(10, 80),
    so2: randomBetween(5, 60),
    o3: randomBetween(20, 100),
    temperature: randomBetween(22, 35),
    humidity: randomBetween(55, 95),
    windSpeed: randomBetween(0.5, 8),
    windDirection: randomBetween(0, 360),
    pressure: randomBetween(1008, 1020),
  };
}

const stationBaseAqi: Record<string, number> = {
  ST001: 142, ST002: 98, ST003: 0, ST004: 189, ST005: 112, ST006: 88,
  ST007: 135, ST008: 158, ST009: 75, ST010: 95, ST011: 0, ST012: 165,
  ST013: 55, ST014: 68, ST015: 42, ST016: 120, ST017: 105, ST018: 148,
  ST019: 62, ST020: 78,
};

export function generateCurrentAqi(): AqiReading[] {
  return MOCK_STATIONS.filter(s => s.status === 'online').map(s =>
    generateAqiForStation(s.id, s.name, stationBaseAqi[s.id] || 80)
  );
}

export function generateHourlyData(stationId: string, hours: number = 24): AqiReading[] {
  const station = MOCK_STATIONS.find(s => s.id === stationId);
  if (!station) return [];
  const base = stationBaseAqi[stationId] || 80;
  const readings: AqiReading[] = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const hourFactor = Math.sin((time.getHours() - 6) * Math.PI / 12) * 30;
    const reading = generateAqiForStation(stationId, station.name, base + hourFactor);
    reading.timestamp = time.toISOString();
    readings.push(reading);
  }
  return readings;
}

export function generateDailyData(stationId: string, days: number = 30): AqiReading[] {
  const station = MOCK_STATIONS.find(s => s.id === stationId);
  if (!station) return [];
  const base = stationBaseAqi[stationId] || 80;
  const readings: AqiReading[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 86400000);
    const trend = Math.sin(i * Math.PI / 15) * 25;
    const reading = generateAqiForStation(stationId, station.name, base + trend);
    reading.timestamp = time.toISOString();
    readings.push(reading);
  }
  return readings;
}

export function generateCityAverage24h(): { hours: string[]; cityData: number[]; centerData: number[] } {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const cityData = hours.map((_, i) => {
    const base = 95;
    const hourEffect = Math.sin((i - 6) * Math.PI / 12) * 35;
    const noise = randomBetween(-5, 5);
    return Math.round(base + hourEffect + noise);
  });
  const centerData = cityData.map(v => Math.round(v * randomBetween(1.1, 1.3)));
  return { hours, cityData, centerData };
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#8b5cf6';
  return '#991b1b';
}

export function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Tốt';
  if (aqi <= 100) return 'Trung bình';
  if (aqi <= 150) return 'Kém';
  if (aqi <= 200) return 'Xấu';
  if (aqi <= 300) return 'Rất xấu';
  return 'Nguy hiểm';
}

export function getAqiLevelClass(aqi: number): string {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sg';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

export function calculateStats(readings: AqiReading[]): AqiStats {
  const values = readings.map(r => r.aqi).filter(v => v > 0);
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return {
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    mean: Math.round(mean),
    std: Math.round(Math.sqrt(variance)),
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
  };
}
