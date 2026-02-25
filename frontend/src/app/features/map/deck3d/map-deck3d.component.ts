import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AqiService } from '../../../core/services/aqi.service';
import { StationService } from '../../../core/services/station.service';
import { AqiReading, Station } from '../../../core/models';
import { getAqiColor, getAqiLabel } from '../../../core/mock-data';

declare var deck: any;
declare var mapboxgl: any;

@Component({
  selector: 'app-map-deck3d',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-page animate-fade-in">
      <div class="map-header">
        <div>
          <h1><i class="fas fa-cube"></i> Bản đồ 3D AQI</h1>
          <p>Deck.gl Column Visualization · Chiều cao = Mức AQI</p>
        </div>
        <div class="controls">
          <select [(ngModel)]="colorMode" (change)="updateLayers()" class="map-select">
            <option value="aqi">Màu theo AQI</option>
            <option value="pm25">Màu theo PM2.5</option>
          </select>
          <select [(ngModel)]="radiusScale" (change)="updateLayers()" class="map-select">
            <option value="200">Bán kính nhỏ</option>
            <option value="400">Bán kính vừa</option>
            <option value="600">Bán kính lớn</option>
          </select>
          <button class="btn-refresh" (click)="refreshData()">
            <i class="fas fa-sync-alt" [class.fa-spin]="refreshing"></i> Làm mới
          </button>
        </div>
      </div>
      <div class="map-wrapper">
        <div #mapContainer class="map-container"></div>
        <!-- Info Panel -->
        <div class="info-panel" *ngIf="selectedStation">
          <button class="close-btn" (click)="selectedStation = null"><i class="fas fa-times"></i></button>
          <h3>{{ selectedStation.stationName }}</h3>
          <div class="panel-aqi" [style.color]="getAqiColor(selectedStation.aqi)">
            {{ selectedStation.aqi }}
            <span class="aqi-label" [style.background]="getAqiColor(selectedStation.aqi) + '20'"
                  [style.color]="getAqiColor(selectedStation.aqi)">{{ getAqiLabel(selectedStation.aqi) }}</span>
          </div>
          <div class="panel-grid">
            <div class="pi"><span class="pl">PM2.5</span><span class="pv">{{ selectedStation.pm25 }} µg/m³</span></div>
            <div class="pi"><span class="pl">PM10</span><span class="pv">{{ selectedStation.pm10 }} µg/m³</span></div>
            <div class="pi"><span class="pl">CO</span><span class="pv">{{ selectedStation.co }} mg/m³</span></div>
            <div class="pi"><span class="pl">NO₂</span><span class="pv">{{ selectedStation.no2 }} µg/m³</span></div>
            <div class="pi"><span class="pl">Nhiệt độ</span><span class="pv">{{ selectedStation.temperature }}°C</span></div>
            <div class="pi"><span class="pl">Gió</span><span class="pv">{{ selectedStation.windSpeed }} m/s</span></div>
          </div>
        </div>
        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-title">Chiều cao = AQI</div>
          <div class="legend-item"><span class="ld" style="background:#22c55e"></span>0-50 Tốt</div>
          <div class="legend-item"><span class="ld" style="background:#eab308"></span>51-100 TB</div>
          <div class="legend-item"><span class="ld" style="background:#f97316"></span>101-150 Kém</div>
          <div class="legend-item"><span class="ld" style="background:#ef4444"></span>151-200 Xấu</div>
          <div class="legend-item"><span class="ld" style="background:#8b5cf6"></span>201-300 Rất xấu</div>
          <div class="legend-item"><span class="ld" style="background:#991b1b"></span>>300 Nguy hiểm</div>
        </div>
        <!-- Stats -->
        <div class="stats-panel">
          <div class="sp-item"><span class="sp-val">{{ currentReadings.length }}</span><span class="sp-lbl">Trạm</span></div>
          <div class="sp-item"><span class="sp-val" [style.color]="getAqiColor(avgAqi)">{{ avgAqi }}</span><span class="sp-lbl">AQI TB</span></div>
          <div class="sp-item"><span class="sp-val">{{ maxAqi }}</span><span class="sp-lbl">AQI Max</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-page { height: calc(100vh - 120px); display: flex; flex-direction: column; }
    .map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .map-header h1 { font-family: 'Outfit'; font-size: 22px; color: #f1f5f9; display: flex; align-items: center; gap: 10px; }
    .map-header h1 i { color: #a78bfa; }
    .map-header p { color: #64748b; font-size: 13px; margin-top: 4px; }
    .controls { display: flex; gap: 8px; align-items: center; }
    .map-select {
      background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 8px 14px;
      border-radius: 8px; font-size: 13px; cursor: pointer;
    }
    .btn-refresh {
      background: rgba(30,41,59,.8); border: 1px solid #334155; color: #94a3b8;
      padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; gap: 6px;
    }
    .btn-refresh:hover { border-color: #38bdf8; color: #38bdf8; }
    .map-wrapper { flex: 1; position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(51,65,85,.4); }
    .map-container { width: 100%; height: 100%; background: #0f172a; }
    .info-panel {
      position: absolute; top: 16px; right: 16px; width: 280px; background: rgba(15,23,42,.95);
      backdrop-filter: blur(20px); border: 1px solid #334155; border-radius: 16px; padding: 20px;
      z-index: 10; animation: fadeIn .3s ease;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
    .close-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; }
    .info-panel h3 { font-family: 'Outfit'; font-size: 16px; color: #f1f5f9; margin-bottom: 8px; }
    .panel-aqi { font-family: 'Outfit'; font-size: 42px; font-weight: 800; line-height: 1; margin-bottom: 12px; }
    .aqi-label { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; margin-left: 8px; vertical-align: middle; }
    .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .pi { background: rgba(30,41,59,.8); padding: 8px 12px; border-radius: 8px; }
    .pl { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    .pv { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .map-legend {
      position: absolute; bottom: 16px; left: 16px; background: rgba(15,23,42,.9);
      backdrop-filter: blur(10px); border: 1px solid #334155; border-radius: 12px; padding: 14px;
      z-index: 10; font-size: 11px;
    }
    .legend-title { font-weight: 700; color: #e2e8f0; margin-bottom: 8px; font-family: 'Outfit'; font-size: 12px; }
    .legend-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; margin-bottom: 4px; }
    .ld { width: 10px; height: 10px; border-radius: 3px; }
    .stats-panel {
      position: absolute; top: 16px; left: 16px; background: rgba(15,23,42,.9);
      backdrop-filter: blur(10px); border: 1px solid #334155; border-radius: 12px; padding: 14px;
      z-index: 10; display: flex; gap: 16px;
    }
    .sp-item { text-align: center; }
    .sp-val { font-family: 'Outfit'; font-size: 22px; font-weight: 700; color: #f1f5f9; display: block; }
    .sp-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
  `]
})
export class MapDeck3dComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  currentReadings: AqiReading[] = [];
  stations: Station[] = [];
  selectedStation: AqiReading | null = null;
  colorMode = 'aqi';
  radiusScale = '400';
  refreshing = false;
  avgAqi = 0;
  maxAqi = 0;

  getAqiColor = getAqiColor;
  getAqiLabel = getAqiLabel;

  private deckgl: any = null;
  private animationFrame: any;

  constructor(private aqiService: AqiService, private stationService: StationService) {}

  ngOnInit() {
    this.stationService.getStations().subscribe(s => this.stations = s);
    this.aqiService.getCurrentAqi().subscribe(r => {
      this.currentReadings = r;
      this.avgAqi = Math.round(r.reduce((s, x) => s + x.aqi, 0) / r.length);
      this.maxAqi = Math.max(...r.map(x => x.aqi));
      if (this.deckgl) this.updateLayers();
    });
  }

  ngAfterViewInit() {
    this.loadDeckGL();
  }

  ngOnDestroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.deckgl) this.deckgl.finalize();
  }

  loadDeckGL() {
    // Load Deck.gl and Mapbox from CDN
    const loadScript = (src: string): Promise<void> => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script'); s.src = src; s.onload = () => resolve(); s.onerror = reject; document.head.appendChild(s);
    });
    const loadCss = (href: string) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
    };

    loadCss('https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css');
    Promise.all([
      loadScript('https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'),
      loadScript('https://unpkg.com/deck.gl@8.9.35/dist.min.js'),
    ]).then(() => {
      setTimeout(() => this.initDeck(), 300);
    });
  }

  initDeck() {
    if (!this.mapContainer?.nativeElement) return;

    // Use a free alternative style (no token required)
    const INITIAL_VIEW_STATE = {
      longitude: 105.8542,
      latitude: 21.0285,
      zoom: 10.5,
      pitch: 55,
      bearing: -20
    };

    this.deckgl = new deck.DeckGL({
      container: this.mapContainer.nativeElement,
      mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      initialViewState: INITIAL_VIEW_STATE,
      controller: true,
      layers: this.buildLayers(),
      getTooltip: (info: any) => {
        if (info.object) {
          const d = info.object;
          return {
            html: `<div style="font-family:DM Sans;padding:4px"><b style="color:${getAqiColor(d.aqi)}">${d.stationName}</b><br/>AQI: <b>${d.aqi}</b> · PM2.5: ${d.pm25}<br/>Temp: ${d.temperature}°C</div>`,
            style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontSize: '12px' }
          };
        }
        return null;
      },
      onClick: (info: any) => {
        if (info.object) {
          this.selectedStation = info.object;
        }
      }
    });

    this.updateLayers();
  }

  buildLayers(): any[] {
    if (typeof deck === 'undefined') return [];

    const data = this.currentReadings.map(r => {
      const station = this.stations.find(s => s.id === r.stationId);
      if (!station) return null;
      return { ...r, latitude: station.latitude, longitude: station.longitude };
    }).filter(Boolean);

    const radius = parseInt(this.radiusScale);

    const hexToRgb = (hex: string): [number, number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b, 200];
    };

    return [
      // 3D Column Layer
      new deck.ColumnLayer({
        id: 'aqi-columns',
        data,
        diskResolution: 12,
        radius: radius,
        extruded: true,
        elevationScale: 25,
        getPosition: (d: any) => [d.longitude, d.latitude],
        getFillColor: (d: any) => hexToRgb(this.colorMode === 'pm25' ? this.getPm25Color(d.pm25) : getAqiColor(d.aqi)),
        getElevation: (d: any) => d.aqi,
        pickable: true,
        autoHighlight: true,
        highlightColor: [56, 189, 248, 180],
        transitions: { getElevation: 800, getFillColor: 500 }
      }),
      // Scatterplot at base for glow effect
      new deck.ScatterplotLayer({
        id: 'aqi-scatter',
        data,
        getPosition: (d: any) => [d.longitude, d.latitude],
        getFillColor: (d: any) => hexToRgb(getAqiColor(d.aqi)),
        getRadius: radius * 1.5,
        pickable: false,
        opacity: 0.3,
      }),
      // Text labels
      new deck.TextLayer({
        id: 'aqi-labels',
        data,
        getPosition: (d: any) => [d.longitude, d.latitude, d.aqi * 25 + 200],
        getText: (d: any) => String(d.aqi),
        getSize: 14,
        getColor: [241, 245, 249, 255],
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'Outfit',
        fontWeight: 700,
        pickable: false,
      })
    ];
  }

  getPm25Color(pm25: number): string {
    if (pm25 <= 25) return '#22c55e';
    if (pm25 <= 50) return '#eab308';
    if (pm25 <= 100) return '#f97316';
    if (pm25 <= 150) return '#ef4444';
    return '#8b5cf6';
  }

  updateLayers() {
    if (this.deckgl) {
      this.deckgl.setProps({ layers: this.buildLayers() });
    }
  }

  refreshData() {
    this.refreshing = true;
    this.aqiService.getCurrentAqi().subscribe(r => {
      this.currentReadings = r;
      this.avgAqi = Math.round(r.reduce((s, x) => s + x.aqi, 0) / r.length);
      this.maxAqi = Math.max(...r.map(x => x.aqi));
      this.updateLayers();
      setTimeout(() => this.refreshing = false, 500);
    });
  }
}
