import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { getAqiColor } from '../../../core/mock-data';

@Component({
  selector: 'app-map-forecast', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in">
    <div class="pg-hdr"><div><h1><i class="fas fa-cloud-sun"></i> Bản đồ Dự báo AQI</h1><p>Dự báo chất lượng không khí {{horizonLabel}}</p></div>
      <div class="hdr-controls">
        <div class="horizon-tabs"><button *ngFor="let h of horizons" [class.active]="horizon===h.value" (click)="setHorizon(h.value)">{{h.label}}</button></div>
      </div>
    </div>
    <div class="map-container">
      <div id="forecastMap" style="height:calc(100vh - 200px);border-radius:16px;overflow:hidden"></div>
      <div class="map-overlay">
        <div class="forecast-info">
          <h4><i class="fas fa-clock"></i> {{horizonLabel}}</h4>
          <div class="forecast-stats">
            <div class="fs"><span class="fsl">AQI TB dự báo</span><span class="fsv" [style.color]="getAqiColor(avgForecast)">{{avgForecast}}</span></div>
            <div class="fs"><span class="fsl">Trạm xấu nhất</span><span class="fsv" style="color:#ef4444">{{worstStation}}</span></div>
            <div class="fs"><span class="fsl">Trạm tốt nhất</span><span class="fsv" style="color:#22c55e">{{bestStation}}</span></div>
            <div class="fs"><span class="fsl">Độ tin cậy</span><span class="fsv" style="color:#a78bfa">{{confidence}}%</span></div>
          </div>
        </div>
        <div class="legend"><h4>AQI Dự báo</h4>
          <div *ngFor="let l of legendItems" class="legend-item"><span class="ldot" [style.background]="l.color"></span>{{l.label}}</div>
        </div>
      </div>
    </div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .horizon-tabs{display:flex;gap:4px;background:rgba(30,41,59,.8);border-radius:10px;padding:3px}.horizon-tabs button{background:none;border:none;color:#64748b;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s}.horizon-tabs button.active{background:rgba(56,189,248,.15);color:#38bdf8}
    .map-container{position:relative}.map-overlay{position:absolute;top:16px;right:16px;z-index:1000;display:flex;flex-direction:column;gap:10px}
    .forecast-info{background:rgba(15,23,42,.9);backdrop-filter:blur(12px);border:1px solid rgba(51,65,85,.5);border-radius:14px;padding:16px;min-width:220px}
    .forecast-info h4{font-family:'Outfit';font-size:13px;color:#94a3b8;margin-bottom:10px;display:flex;align-items:center;gap:6px}.forecast-info h4 i{color:#38bdf8}
    .forecast-stats{display:flex;flex-direction:column;gap:6px}.fs{display:flex;justify-content:space-between;align-items:center;padding:6px 0}.fsl{font-size:11px;color:#64748b}.fsv{font-family:'Outfit';font-size:16px;font-weight:700}
    .legend{background:rgba(15,23,42,.9);backdrop-filter:blur(12px);border:1px solid rgba(51,65,85,.5);border-radius:14px;padding:14px}.legend h4{font-family:'Outfit';font-size:12px;color:#94a3b8;margin-bottom:8px}.legend-item{display:flex;align-items:center;gap:8px;font-size:11px;color:#cbd5e1;padding:3px 0}.ldot{width:12px;height:12px;border-radius:3px;flex-shrink:0}`]
})
export class MapForecastComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  private markers: L.Layer[] = [];
  horizon = 24; horizonLabel = '24 giờ tới';
  horizons = [{value:6,label:'6h'},{value:12,label:'12h'},{value:24,label:'24h'},{value:48,label:'48h'},{value:72,label:'72h'}];
  avgForecast = 0; worstStation = ''; bestStation = ''; confidence = 87;
  getAqiColor = getAqiColor;
  legendItems = [{color:'#22c55e',label:'0-50: Tốt'},{color:'#eab308',label:'51-100: TB'},{color:'#f97316',label:'101-150: Kém'},{color:'#ef4444',label:'151-200: Xấu'},{color:'#8b5cf6',label:'201-300: Rất xấu'},{color:'#991b1b',label:'>300: Nguy hiểm'}];

  ngAfterViewInit() { setTimeout(() => this.initMap(), 100); }
  ngOnDestroy() { this.map?.remove(); }

  initMap() {
    this.map = L.map('forecastMap', { center: [21.0285, 105.8542], zoom: 12, zoomControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '' }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.renderForecast();
  }

  setHorizon(h: number) {
    this.horizon = h;
    this.horizonLabel = `${h} giờ tới`;
    this.confidence = Math.max(65, 95 - (h - 6) * 0.4);
    this.renderForecast();
  }

  renderForecast() {
    this.markers.forEach(m => this.map?.removeLayer(m));
    this.markers = [];
    const stations = MOCK_STATIONS.filter(s => s.status === 'online');
    const forecasts = stations.map(s => {
      const base = 50 + Math.random() * 120;
      const drift = (this.horizon / 24) * (Math.random() * 40 - 10);
      return { ...s, forecastAqi: Math.round(base + drift) };
    });
    this.avgForecast = Math.round(forecasts.reduce((s, f) => s + f.forecastAqi, 0) / forecasts.length);
    const sorted = [...forecasts].sort((a, b) => b.forecastAqi - a.forecastAqi);
    this.worstStation = `${sorted[0]?.name?.split(' ').pop()} (${sorted[0]?.forecastAqi})`;
    this.bestStation = `${sorted[sorted.length-1]?.name?.split(' ').pop()} (${sorted[sorted.length-1]?.forecastAqi})`;

    forecasts.forEach(f => {
      const color = getAqiColor(f.forecastAqi);
      // Forecast circle with pulse effect
      const circle = L.circleMarker([f.latitude, f.longitude], {
        radius: 18, fillColor: color, color: color, fillOpacity: 0.3, weight: 2, opacity: 0.6
      }).addTo(this.map!);
      // Inner marker
      const inner = L.circleMarker([f.latitude, f.longitude], {
        radius: 8, fillColor: color, color: '#fff', fillOpacity: 0.9, weight: 1
      }).addTo(this.map!);
      inner.bindPopup(`<div style="font-family:DM Sans"><b>${f.name}</b><br>AQI dự báo ${this.horizon}h: <b style="color:${color}">${f.forecastAqi}</b><br>Độ tin cậy: ${Math.round(this.confidence)}%</div>`);
      // AQI label
      const label = L.marker([f.latitude, f.longitude], {
        icon: L.divIcon({ html: `<span style="color:#fff;font-weight:800;font-size:11px;font-family:Outfit;text-shadow:0 1px 3px rgba(0,0,0,.8)">${f.forecastAqi}</span>`,
          className: 'aqi-label', iconSize: [30, 16], iconAnchor: [15, 8] })
      }).addTo(this.map!);
      this.markers.push(circle, inner, label);
    });
  }
}
