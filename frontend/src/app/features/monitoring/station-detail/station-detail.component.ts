import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core'; import { CommonModule } from '@angular/common'; import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs'; import { AqiService } from '../../../core/services/aqi.service'; import { StationService } from '../../../core/services/station.service';
import { Station, AqiReading } from '../../../core/models'; import { getAqiColor, getAqiLabel, getAqiLevelClass } from '../../../core/mock-data';
import { DxCircularGaugeModule } from 'devextreme-angular';
declare var echarts: any;
@Component({
  selector: 'app-station-detail', standalone: true, imports: [CommonModule, RouterModule, DxCircularGaugeModule],
  template: `<div class="page animate-fade-in" *ngIf="station">
    <div class="pg-hdr"><div><a routerLink="/monitoring/realtime" class="back"><i class="fas fa-arrow-left"></i></a><h1>{{station.name}}</h1><p>{{station.code}} · {{station.district}} · {{station.address}}</p></div>
      <span class="st-pill" [ngClass]="station.status"><i class="fas fa-circle"></i> {{station.status==='online'?'Online':station.status==='offline'?'Offline':'Bảo trì'}}</span></div>
    <div class="aqi-hero" *ngIf="currentReading"><div class="aqi-big" [style.color]="getAqiColor(currentReading.aqi)">{{currentReading.aqi}}</div><span class="aqi-label-badge" [ngClass]="getAqiLevelClass(currentReading.aqi)">{{getAqiLabel(currentReading.aqi)}}</span></div>
    <div class="gauges-grid">
      <div *ngFor="let g of gaugeItems" class="gauge-card">
        <span class="g-label">{{g.label}}</span>
        <dx-circular-gauge [value]="g.value" style="height:120px; width: 100%;">
          <dxo-scale [startValue]="0" [endValue]="g.max" [tickInterval]="g.max/2">
            <dxo-label [visible]="true"></dxo-label>
          </dxo-scale>
          <dxo-range-container>
            <dxi-range [startValue]="0" [endValue]="g.value" [color]="g.color"></dxi-range>
            <dxi-range [startValue]="g.value" [endValue]="g.max" color="rgba(51, 65, 85, 0.5)"></dxi-range>
          </dxo-range-container>
          <dxo-value-indicator type="textCloud" [color]="g.color"></dxo-value-indicator>
          <dxo-title [text]="g.unit" subtitle=" " [font]="{size: 10, color: '#64748b'}"></dxo-title>
        </dx-circular-gauge>
      </div>
    </div>
    <div class="chart-card"><h3><i class="fas fa-chart-line"></i> AQI 24 giờ qua</h3><div #histChart style="height:300px"></div></div>
    <div class="info-grid"><div class="info-card"><h4><i class="fas fa-microchip"></i> Sensors ({{station.sensors.length}})</h4><div class="sensor-list"><div *ngFor="let s of station.sensors" class="sensor-row"><span class="s-dot" [ngClass]="s.status"></span><span class="s-type">{{s.type}}</span><span class="s-model">{{s.model}}</span><span class="s-serial">{{s.serial}}</span></div></div></div>
      <div class="info-card"><h4><i class="fas fa-info-circle"></i> Thông tin trạm</h4><div class="detail-list"><div class="dl-row"><span>MQTT Topic</span><code>{{station.mqttTopic}}</code></div><div class="dl-row"><span>Đơn vị quản lý</span><span>{{station.managedBy}}</span></div><div class="dl-row"><span>Ngày lắp đặt</span><span>{{station.installedDate}}</span></div><div class="dl-row"><span>Tọa độ</span><span>{{station.latitude}}, {{station.longitude}}</span></div></div></div></div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:inline}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}.back{color:#38bdf8;margin-right:10px;text-decoration:none;font-size:16px}
    .st-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}.st-pill i{font-size:6px}.st-pill.online{background:rgba(34,197,94,.1);color:#22c55e}.st-pill.offline{background:rgba(239,68,68,.1);color:#ef4444}.st-pill.maintenance{background:rgba(234,179,8,.1);color:#eab308}
    .aqi-hero{text-align:center;margin-bottom:24px}.aqi-big{font-family:'Outfit';font-size:72px;font-weight:800;line-height:1}.aqi-label-badge{display:inline-block;padding:6px 20px;border-radius:12px;font-size:14px;font-weight:700;margin-top:8px}
    .aqi-label-badge.good{background:rgba(34,197,94,.15);color:#22c55e}.aqi-label-badge.moderate{background:rgba(234,179,8,.15);color:#eab308}.aqi-label-badge.unhealthy-sg{background:rgba(249,115,22,.15);color:#f97316}.aqi-label-badge.unhealthy{background:rgba(239,68,68,.15);color:#ef4444}.aqi-label-badge.very-unhealthy{background:rgba(139,92,246,.15);color:#8b5cf6}.aqi-label-badge.hazardous{background:rgba(153,27,27,.2);color:#fca5a5}
    .gauges-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px}.gauge-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:14px;text-align:center}.g-label{display:block;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px;margin-bottom:20px}.chart-card h3{font-family:'Outfit';font-size:15px;color:#e2e8f0;margin-bottom:14px;display:flex;align-items:center;gap:8px}.chart-card h3 i{color:#38bdf8}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.info-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:18px}.info-card h4{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:12px;display:flex;align-items:center;gap:8px}.info-card h4 i{color:#38bdf8;font-size:13px}
    .sensor-list{display:flex;flex-direction:column;gap:6px}.sensor-row{display:flex;align-items:center;gap:10px;padding:8px;background:rgba(15,23,42,.4);border-radius:8px;font-size:12px;color:#cbd5e1}.s-dot{width:6px;height:6px;border-radius:50%}.s-dot.active{background:#22c55e}.s-dot.inactive{background:#64748b}.s-dot.error{background:#ef4444}.s-type{font-weight:600;color:#e2e8f0;min-width:70px}.s-model{color:#94a3b8}.s-serial{margin-left:auto;font-family:'JetBrains Mono';font-size:10px;color:#64748b}
    .detail-list{display:flex;flex-direction:column;gap:8px}.dl-row{display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(15,23,42,.4);border-radius:8px;font-size:12px;color:#cbd5e1}.dl-row span:first-child{color:#64748b}.dl-row code{font-family:'JetBrains Mono';font-size:11px;color:#22c55e}
    @media(max-width:768px){.info-grid{grid-template-columns:1fr}.gauges-grid{grid-template-columns:repeat(2,1fr)}}`]
})
export class StationDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('histChart') chartEl!: ElementRef; station: Station | null = null; currentReading: AqiReading | null = null; gaugeItems: any[] = [];
  getAqiColor = getAqiColor; getAqiLabel = getAqiLabel; getAqiLevelClass = getAqiLevelClass; private chart: any;
  constructor(private route: ActivatedRoute, private stationSvc: StationService, private aqiSvc: AqiService) { }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || ''; this.stationSvc.getStations().pipe(map(stations => stations.find(s => s.id === id) || null)).subscribe(s => { this.station = s; });
    this.aqiSvc.getCurrentAqi().subscribe(r => { this.currentReading = r.find(x => x.stationId === (this.route.snapshot.paramMap.get('id'))) || r[0]; this.buildGauges(); })
  }
  ngAfterViewInit() { setTimeout(() => this.renderChart(), 400) }
  buildGauges() {
    const r = this.currentReading; if (!r) return;
    this.gaugeItems = [{ label: 'PM2.5', value: r.pm25, unit: 'µg/m³', percent: Math.min(r.pm25 / 150 * 100, 100), color: r.pm25 > 100 ? '#ef4444' : r.pm25 > 50 ? '#f97316' : '#22c55e' },
    { label: 'PM10', value: r.pm10, unit: 'µg/m³', percent: Math.min(r.pm10 / 200 * 100, 100), color: r.pm10 > 150 ? '#ef4444' : r.pm10 > 100 ? '#f97316' : '#22c55e' },
    { label: 'CO', value: r.co, unit: 'mg/m³', percent: Math.min(r.co / 30 * 100, 100), color: r.co > 15 ? '#ef4444' : r.co > 10 ? '#f97316' : '#22c55e' },
    { label: 'NO₂', value: r.no2, unit: 'µg/m³', percent: Math.min(r.no2 / 200 * 100, 100), color: r.no2 > 100 ? '#ef4444' : r.no2 > 60 ? '#f97316' : '#22c55e' },
    { label: 'SO₂', value: r.so2, unit: 'µg/m³', percent: Math.min(r.so2 / 200 * 100, 100), color: r.so2 > 80 ? '#ef4444' : r.so2 > 40 ? '#f97316' : '#22c55e' },
    { label: 'O₃', value: r.o3, unit: 'µg/m³', percent: Math.min(r.o3 / 200 * 100, 100), color: r.o3 > 100 ? '#ef4444' : r.o3 > 60 ? '#f97316' : '#22c55e' },
    { label: 'Nhiệt độ', value: r.temperature, unit: '°C', percent: Math.min(r.temperature! / 45 * 100, 100), color: '#38bdf8' },
    { label: 'Độ ẩm', value: r.humidity, unit: '%', percent: r.humidity!, color: '#a78bfa' }]
  }
  renderChart() {
    if (!this.chartEl?.nativeElement || typeof echarts === 'undefined') return; this.chart = echarts.init(this.chartEl.nativeElement);
    const id = this.route.snapshot.paramMap.get('id') || 'ST001';
    this.aqiSvc.getHourlyData(id, 24).subscribe(data => {
      this.chart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } }, grid: { left: '3%', right: '3%', bottom: '3%', top: '8%', containLabel: true }, xAxis: { type: 'category', data: data.map((d: any) => new Date(d.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } } }, yAxis: { type: 'value', name: 'AQI', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.3)', type: 'dashed' } } }, series: [{ type: 'line', data: data.map((d: any) => d.aqi), smooth: true, symbol: 'none', lineStyle: { width: 3, color: '#38bdf8' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(56,189,248,.2)' }, { offset: 1, color: 'rgba(56,189,248,0)' }] } } }] });
      window.addEventListener('resize', () => this.chart?.resize());
    })
  }
}
