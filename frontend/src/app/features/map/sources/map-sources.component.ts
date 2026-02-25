import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
@Component({
  selector: 'app-map-sources', standalone: true, imports: [CommonModule],
  template: `
    <div class="map-page">
      <div class="map-header">
        <div>
          <h1><i class="fas fa-industry"></i> Bản đồ Nguồn Phát thải</h1>
          <p>Mô phỏng khuếch tán Gaussian Plume từ các khu công nghiệp / bãi rác</p>
        </div>
        <div class="legend">
          <div class="legend-item"><span class="lg-box" style="background:rgba(239,68,68,0.4);border-color:#ef4444"></span>Phát thải Cao</div>
          <div class="legend-item"><span class="lg-box" style="background:rgba(249,115,22,0.4);border-color:#f97316"></span>Phát thải TB</div>
          <div class="legend-item"><span class="lg-box" style="background:rgba(234,179,8,0.4);border-color:#eab308"></span>Phát thải Thấp</div>
        </div>
      </div>
      <div class="map-wrapper">
        <div id="sourcesMap" class="map-container"></div>
        <div class="wind-info">
          <i class="fas fa-wind" style="font-size: 20px; color: #38bdf8; margin-right: 12px;"></i>
          <div>
            <strong>Hướng gió hiện tại:</strong> Đông Bắc (Gió mùa Đông Bắc)<br/>
            <strong>Tốc độ trung bình:</strong> 4.5 m/s
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-page { height: calc(100vh - 120px); display: flex; flex-direction: column; }
    .map-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .map-header h1 { font-family: 'Outfit'; font-size: 22px; color: #f1f5f9; display: flex; align-items: center; gap: 10px; margin: 0 0 6px 0; }
    .map-header h1 i { color: #f97316; }
    .map-header p { color: #94a3b8; font-size: 13px; margin: 0; }
    
    .legend { display: flex; gap: 12px; background: rgba(15,23,42,0.6); padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(51,65,85,0.4); }
    .legend-item { display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 12px; font-weight: 500; }
    .lg-box { width: 14px; height: 14px; border-radius: 4px; border: 1px solid; }

    .map-wrapper { flex: 1; position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(51,65,85,0.4); }
    .map-container { width: 100%; height: 100%; background: #0f172a; }
    
    .wind-info {
      position: absolute; bottom: 20px; right: 20px; background: rgba(15,23,42,0.9); backdrop-filter: blur(10px);
      border: 1px solid rgba(56,189,248,0.4); border-radius: 12px; padding: 16px; z-index: 1000;
      color: #e2e8f0; font-size: 13px; display: flex; align-items: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    }
  `]
})
export class MapSourcesComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;

  // Mock Sources
  // Wind is blowing FROM NE (45 deg) TO SW (225 deg). So plume direction is 225.
  private sources = [
    { name: 'Khu công nghiệp Gang thép Thái Nguyên', lat: 21.56, lng: 105.86, type: 'Công nghiệp nặng', emission: 'high', windDir: 225 },
    { name: 'KCN Quế Võ - Bắc Ninh', lat: 21.16, lng: 106.05, type: 'Công nghiệp', emission: 'high', windDir: 220 },
    { name: 'KCN Thăng Long (Đông Anh)', lat: 21.12, lng: 105.78, type: 'Công nghiệp nhẹ', emission: 'medium', windDir: 225 },
    { name: 'Bãi rác Nam Sơn', lat: 21.32, lng: 105.81, type: 'Chất thải', emission: 'high', windDir: 230 },
    { name: 'KCN Phố Nối (Hưng Yên)', lat: 20.93, lng: 106.02, type: 'Công nghiệp', emission: 'medium', windDir: 215 },
    { name: 'Làng nghề tái chế Yên Phong', lat: 21.21, lng: 105.99, type: 'Làng nghề', emission: 'high', windDir: 220 },
    { name: 'Lò đốt rác Xuân Sơn', lat: 21.05, lng: 105.51, type: 'Chất thải', emission: 'low', windDir: 225 }
  ];

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  initMap() {
    this.map = L.map('sourcesMap', { zoomControl: false }).setView([21.15, 105.85], 10);
    L.control.zoom({ position: 'topleft' }).addTo(this.map);

    // Dark matter basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB', maxZoom: 19
    }).addTo(this.map);

    this.drawSourcesAndPlumes();
  }

  drawSourcesAndPlumes() {
    if (!this.map) return;

    this.sources.forEach(source => {
      // Draw Source Marker
      const iconHtml = `<div style="
        width:24px;height:24px;border-radius:50%;background:#1e293b;
        display:flex;align-items:center;justify-content:center;
        color:${this.getColor(source.emission)};font-size:12px;
        border:2px solid ${this.getColor(source.emission)};
      "><i class="fas fa-industry"></i></div>`;

      const icon = L.divIcon({
        className: 'source-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([source.lat, source.lng], { icon })
        .addTo(this.map!)
        .bindPopup(`<strong>${source.name}</strong><br/>Loại: ${source.type}<br/>Mức độ phát thải: ${source.emission.toUpperCase()}`);

      // Draw Plume Polygon
      const plume = this.calculatePlumePolygon(source.lat, source.lng, source.windDir, source.emission);

      L.polygon(plume as L.LatLngExpression[], {
        color: this.getColor(source.emission),
        fillColor: this.getColor(source.emission),
        fillOpacity: 0.3,
        weight: 1,
        smoothFactor: 1
      }).addTo(this.map!);

      // Add gradient effect (simplified inner polygon)
      const innerPlume = this.calculatePlumePolygon(source.lat, source.lng, source.windDir, source.emission, 0.5);
      L.polygon(innerPlume as L.LatLngExpression[], {
        color: 'transparent',
        fillColor: this.getColor(source.emission),
        fillOpacity: 0.5,
        stroke: false
      }).addTo(this.map!);
    });
  }

  // Calculate a cone-like polygon representing the dispersion plume
  // Uses rough Haversine/flat earth approx for small distances
  calculatePlumePolygon(lat: number, lng: number, windDir: number, emission: string, scale: number = 1.0) {
    // Length of plume based on emission (in degrees lat/lng approx)
    // Roughly: High = 30km (0.27 deg), Medium = 15km (0.13 deg), Low = 7km (0.06 deg)
    const lengthMap: Record<string, number> = { 'high': 0.3, 'medium': 0.15, 'low': 0.08 };
    const baseLength = lengthMap[emission] * scale;

    // Spread angle of the plume (in degrees)
    const spread = 25 * scale;

    const dirRad = (windDir * Math.PI) / 180;
    const dirRadLeft = ((windDir - spread) * Math.PI) / 180;
    const dirRadRight = ((windDir + spread) * Math.PI) / 180;

    // To account for longitude stretching at ~21 deg latitude
    const lngAdjust = Math.cos(lat * Math.PI / 180);

    const ptCenter = [
      lat + Math.cos(dirRad) * (baseLength * 1.1),
      lng + Math.sin(dirRad) * (baseLength * 1.1) / lngAdjust
    ];

    const ptLeft = [
      lat + Math.cos(dirRadLeft) * baseLength,
      lng + Math.sin(dirRadLeft) * baseLength / lngAdjust
    ];

    const ptRight = [
      lat + Math.cos(dirRadRight) * baseLength,
      lng + Math.sin(dirRadRight) * baseLength / lngAdjust
    ];

    return [
      [lat, lng],
      ptLeft,
      ptCenter, // Rounded tip
      ptRight
    ];
  }

  getColor(emission: string): string {
    return { 'high': '#ef4444', 'medium': '#f97316', 'low': '#eab308' }[emission] || '#fff';
  }
}