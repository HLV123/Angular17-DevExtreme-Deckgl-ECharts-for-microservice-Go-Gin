import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AqiService } from '../../../core/services/aqi.service';
import { StationService } from '../../../core/services/station.service';
import { AqiReading, Station } from '../../../core/models';
import { getAqiColor, getAqiLabel } from '../../../core/mock-data';
import * as L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';

@Component({
  selector: 'app-map-realtime',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-page">
      <div class="map-header">
        <h1><i class="fas fa-map-marked-alt"></i> Bản đồ AQI Thời gian thực</h1>
        <div class="map-controls">
          <select [(ngModel)]="selectedLayer" (change)="changeLayer()" class="map-select">
            <option value="markers">Marker trạm</option>
            <option value="cluster">Marker Cluster</option>
            <option value="heatmap">Heatmap cơ bản</option>
            <option value="idw">Nội suy IDW (Gradient)</option>
          </select>
        </div>
      </div>
      <div class="map-wrapper">
        <div id="leafletMap" class="map-container"></div>
        <!-- Floating panel -->
        <div class="info-panel" *ngIf="selectedStation">
          <button class="close-panel" (click)="selectedStation = null"><i class="fas fa-times"></i></button>
          <h3>{{ selectedStation.stationName }}</h3>
          <div class="panel-aqi" [style.color]="getAqiColor(selectedStation.aqi)">
            {{ selectedStation.aqi }}
            <span class="panel-label" [style.background]="getAqiColor(selectedStation.aqi) + '20'" [style.color]="getAqiColor(selectedStation.aqi)">{{ getAqiLabel(selectedStation.aqi) }}</span>
          </div>
          <div class="panel-grid">
            <div class="panel-item"><span class="pi-label">PM2.5</span><span class="pi-val">{{ selectedStation.pm25 }} µg/m³</span></div>
            <div class="panel-item"><span class="pi-label">PM10</span><span class="pi-val">{{ selectedStation.pm10 }} µg/m³</span></div>
            <div class="panel-item"><span class="pi-label">CO</span><span class="pi-val">{{ selectedStation.co }} mg/m³</span></div>
            <div class="panel-item"><span class="pi-label">NO₂</span><span class="pi-val">{{ selectedStation.no2 }} µg/m³</span></div>
            <div class="panel-item"><span class="pi-label">SO₂</span><span class="pi-val">{{ selectedStation.so2 }} µg/m³</span></div>
            <div class="panel-item"><span class="pi-label">O₃</span><span class="pi-val">{{ selectedStation.o3 }} µg/m³</span></div>
            <div class="panel-item"><span class="pi-label">Nhiệt độ</span><span class="pi-val">{{ selectedStation.temperature }}°C</span></div>
            <div class="panel-item"><span class="pi-label">Độ ẩm</span><span class="pi-val">{{ selectedStation.humidity }}%</span></div>
          </div>
        </div>
        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-title">Chỉ số AQI</div>
          <div class="legend-item"><span class="lg-dot" style="background:#22c55e"></span>0-50 Tốt</div>
          <div class="legend-item"><span class="lg-dot" style="background:#eab308"></span>51-100 TB</div>
          <div class="legend-item"><span class="lg-dot" style="background:#f97316"></span>101-150 Kém</div>
          <div class="legend-item"><span class="lg-dot" style="background:#ef4444"></span>151-200 Xấu</div>
          <div class="legend-item"><span class="lg-dot" style="background:#8b5cf6"></span>201-300 Rất xấu</div>
          <div class="legend-item"><span class="lg-dot" style="background:#991b1b"></span>>300 Nguy hiểm</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-page { height: calc(100vh - 120px); display: flex; flex-direction: column; }
    .map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .map-header h1 { font-family: 'Outfit'; font-size: 22px; color: #f1f5f9; display: flex; align-items: center; gap: 10px; }
    .map-header h1 i { color: #38bdf8; }
    .map-select {
      background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 8px 14px;
      border-radius: 8px; font-size: 13px; cursor: pointer;
    }
    .map-wrapper { flex: 1; position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(51,65,85,0.4); }
    .map-container { width: 100%; height: 100%; background: #0f172a; }
    .info-panel {
      position: absolute; top: 16px; right: 16px; width: 300px; background: rgba(15,23,42,0.95);
      backdrop-filter: blur(20px); border: 1px solid #334155; border-radius: 16px; padding: 20px;
      z-index: 1000; animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
    .close-panel { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; }
    .info-panel h3 { font-family: 'Outfit'; font-size: 16px; color: #f1f5f9; margin-bottom: 8px; }
    .panel-aqi { font-family: 'Outfit'; font-size: 42px; font-weight: 800; line-height: 1; margin-bottom: 12px; }
    .panel-label { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; margin-left: 8px; vertical-align: middle; }
    .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .panel-item { background: rgba(30,41,59,0.8); padding: 8px 12px; border-radius: 8px; }
    .pi-label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .pi-val { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .map-legend {
      position: absolute; bottom: 16px; left: 16px; background: rgba(15,23,42,0.9);
      backdrop-filter: blur(10px); border: 1px solid #334155; border-radius: 12px; padding: 14px;
      z-index: 1000; font-size: 11px;
    }
    .legend-title { font-weight: 700; color: #e2e8f0; margin-bottom: 8px; font-family: 'Outfit'; font-size: 12px; }
    .legend-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; margin-bottom: 4px; }
    .lg-dot { width: 10px; height: 10px; border-radius: 3px; }
    
    ::ng-deep .marker-cluster-small { background-color: rgba(34, 197, 94, 0.6); }
    ::ng-deep .marker-cluster-small div { background-color: rgba(34, 197, 94, 0.9); color: white; }
    ::ng-deep .marker-cluster-medium { background-color: rgba(249, 115, 22, 0.6); }
    ::ng-deep .marker-cluster-medium div { background-color: rgba(249, 115, 22, 0.9); color: white; }
    ::ng-deep .marker-cluster-large { background-color: rgba(239, 68, 68, 0.6); }
    ::ng-deep .marker-cluster-large div { background-color: rgba(239, 68, 68, 0.9); color: white; }
    ::ng-deep .marker-cluster { background-clip: padding-box; border-radius: 20px; }
    ::ng-deep .marker-cluster div { width: 30px; height: 30px; margin-left: 5px; margin-top: 5px; text-align: center; border-radius: 15px; font-family: 'Outfit'; font-weight: bold; line-height: 30px; }
  `]
})
export class MapRealtimeComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private heatLayer: any = null;
  private idwLayer: any = null;
  private clusterGroup: any = null;
  currentReadings: AqiReading[] = [];
  stations: Station[] = [];
  selectedStation: AqiReading | null = null;
  selectedLayer = 'markers';
  getAqiColor = getAqiColor;
  getAqiLabel = getAqiLabel;

  constructor(private aqiService: AqiService, private stationService: StationService) { }

  ngOnInit() {
    this.stationService.getStations().subscribe(s => this.stations = s);
    this.aqiService.getCurrentAqi().subscribe(r => {
      this.currentReadings = r;
      if (this.map) this.updateMapLayer();
    });
  }

  ngAfterViewInit() { setTimeout(() => this.initMap(), 100); }

  ngOnDestroy() { this.map?.remove(); }

  initMap() {
    this.map = L.map('leafletMap', { zoomControl: false }).setView([21.0285, 105.8542], 11);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB', maxZoom: 19
    }).addTo(this.map);
    if (this.currentReadings.length) this.updateMapLayer();
  }

  updateMapLayer() {
    // Clear all existing layers
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (this.heatLayer) {
      this.map?.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }
    if (this.idwLayer) {
      this.map?.removeLayer(this.idwLayer);
      this.idwLayer = null;
    }
    if (this.clusterGroup) {
      this.map?.removeLayer(this.clusterGroup);
      this.clusterGroup = null;
    }

    if (this.selectedLayer === 'markers') {
      this.addMarkers(false);
    } else if (this.selectedLayer === 'cluster') {
      this.addMarkers(true);
    } else if (this.selectedLayer === 'heatmap') {
      this.addHeatmap();
    } else if (this.selectedLayer === 'idw') {
      this.addIdwMap();
    }
  }

  addMarkers(useCluster: boolean) {
    if (!this.map) return;

    let containerForMarkers: any = this.map;
    if (useCluster) {
      this.clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 60,
        iconCreateFunction: function (cluster: any) {
          const childCount = cluster.getChildCount();
          let c = ' marker-cluster-';
          if (childCount < 10) c += 'small';
          else if (childCount < 30) c += 'medium';
          else c += 'large';
          return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
        }
      });
      containerForMarkers = this.clusterGroup;
    }
    this.currentReadings.forEach(reading => {
      const station = this.stations.find(s => s.id === reading.stationId);
      if (!station) return;
      const color = getAqiColor(reading.aqi);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;background:${color};
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:800;font-size:11px;font-family:Outfit;
          border:3px solid rgba(255,255,255,0.3);
          box-shadow:0 0 20px ${color}80, 0 4px 12px rgba(0,0,0,0.3);
        ">${reading.aqi}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const marker = L.marker([station.latitude, station.longitude], { icon })
        .on('click', () => { this.selectedStation = reading; });

      containerForMarkers.addLayer(marker);
      if (!useCluster) {
        this.markers.push(marker);
      }
    });

    if (useCluster) {
      this.map.addLayer(this.clusterGroup);
    }
  }

  addHeatmap() {
    if (!this.map) return;

    // Convert AQI to simple 0-1 intensity
    const heatData = this.currentReadings
      .map(reading => {
        const station = this.stations.find(s => s.id === reading.stationId);
        if (!station) return null;
        // Normalize AQI (0-300) to intensity (0.2-1.0)
        const intensity = Math.max(0.2, Math.min(1, reading.aqi / 300));
        return [station.latitude, station.longitude, intensity]; // [lat, lng, intensity]
      })
      .filter(Boolean) as [number, number, number][];

    // @ts-ignore
    this.heatLayer = L.heatLayer(heatData, {
      radius: 40,
      blur: 25,
      maxZoom: 14,
      gradient: {
        0.2: '#22c55e', // Good
        0.4: '#eab308', // Moderate
        0.6: '#ef4444', // Unhealthy
        0.8: '#8b5cf6', // Very unhealthy
        1.0: '#991b1b'  // Hazardous
      }
    }).addTo(this.map);
  }

  addIdwMap() {
    if (!this.map) return;

    // Convert AQI to simple 0-300 intensity
    const idwData = this.currentReadings
      .map(reading => {
        const station = this.stations.find(s => s.id === reading.stationId);
        if (!station) return null;
        return [station.latitude, station.longitude, reading.aqi]; // [lat, lng, aqi]
      })
      .filter(Boolean) as [number, number, number][];

    // @ts-ignore
    this.idwLayer = L.idwLayer(idwData, {
      opacity: 0.6,
      maxZoom: 18,
      cellSize: 5,
      exp: 2,
      max: 300 // Max AQI value for gradient scaling
    }).addTo(this.map);
  }

  changeLayer() {
    this.updateMapLayer();
  }
}
