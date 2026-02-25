import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { generateForecast, MOCK_ML_MODELS } from '../../../core/mock-data/others.mock';
declare var echarts: any;

@Component({
  selector: 'app-forecast-dashboard', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-brain"></i> Dashboard Dự báo AQI</h1>
    <p>Dự báo dựa trên mô hình {{activeModel.name}} (R²={{activeModel.metrics.r2}})</p></div></div>
    <div class="controls"><select [(ngModel)]="selectedStation" (change)="updateForecast()" class="sel">
      <option *ngFor="let s of stations" [value]="s.id">{{s.name}}</option></select>
      <select [(ngModel)]="selectedParam" (change)="updateForecast()" class="sel"><option value="aqi">AQI</option><option value="pm25">PM2.5</option><option value="pm10">PM10</option></select>
      <div class="horizon-tabs"><button *ngFor="let h of horizons" [class.active]="horizon===h" (click)="horizon=h;updateForecast()">{{h}}h</button></div></div>
    <div class="chart-row">
      <div class="chart-card main-chart"><h3><i class="fas fa-chart-area"></i> Dự báo {{selectedParam.toUpperCase()}} · {{horizon}} giờ tới</h3><div #forecastChart style="height:380px"></div></div>
      <div class="side-panel">
        <div class="kpi-card"><span class="kl">Giá trị dự báo</span><span class="kv" [style.color]="forecastColor">{{forecastValue}}</span><span class="ku">{{selectedParam==='aqi'?'AQI':'µg/m³'}}</span></div>
        <div class="kpi-card"><span class="kl">Khoảng tin cậy 95%</span><span class="kv ci">{{ciLow}} - {{ciHigh}}</span></div>
        <div class="kpi-card"><span class="kl">Xu hướng</span><span class="kv" [style.color]="trendColor"><i class="fas" [ngClass]="trendIcon"></i> {{trendText}}</span></div>
        <div class="kpi-card"><span class="kl">Mô hình</span><span class="kv model">{{activeModel.algorithm}}</span><span class="ku">RMSE: {{activeModel.metrics.rmse}} · MAE: {{activeModel.metrics.mae}}</span></div>
        <div class="accuracy-card"><h4>So sánh Dự báo vs Thực tế (7 ngày)</h4>
          <div class="acc-bar"><div class="acc-fill" [style.width.%]="accuracy"></div></div>
          <span class="acc-val">Accuracy: {{accuracy}}%</span></div>
      </div>
    </div></div>`,
  styles: [`.pg-hdr{margin-bottom:16px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .controls{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}.sel{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:10px;font-size:12px}
    .horizon-tabs{display:flex;gap:3px;background:rgba(30,41,59,.8);border-radius:10px;padding:3px}.horizon-tabs button{background:none;border:none;color:#64748b;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s}.horizon-tabs button.active{background:rgba(56,189,248,.15);color:#38bdf8}
    .chart-row{display:grid;grid-template-columns:1fr 280px;gap:14px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px}.chart-card h3{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-card h3 i{color:#38bdf8}
    .side-panel{display:flex;flex-direction:column;gap:10px}
    .kpi-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px;text-align:center}.kl{display:block;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}.kv{display:block;font-family:'Outfit';font-size:28px;font-weight:800;color:#f1f5f9}.kv.ci{font-size:18px;color:#a78bfa}.kv.model{font-size:16px;color:#38bdf8}.ku{font-size:10px;color:#64748b}
    .accuracy-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:16px}.accuracy-card h4{font-family:'Outfit';font-size:12px;color:#94a3b8;margin-bottom:10px}
    .acc-bar{height:8px;background:rgba(51,65,85,.5);border-radius:4px;overflow:hidden;margin-bottom:6px}.acc-fill{height:100%;background:linear-gradient(90deg,#0ea5e9,#22c55e);border-radius:4px;transition:width .5s}.acc-val{font-size:12px;color:#22c55e;font-weight:700}
    @media(max-width:900px){.chart-row{grid-template-columns:1fr}}`]
})
export class ForecastDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('forecastChart') chartEl!: ElementRef;
  stations = MOCK_STATIONS.filter(s => s.status === 'online');
  selectedStation = 'ST001'; selectedParam = 'aqi'; horizon = 24;
  horizons = [6, 12, 24, 48, 72];
  activeModel = MOCK_ML_MODELS.find(m => m.status === 'active') || MOCK_ML_MODELS[0];
  forecastValue = 0; ciLow = 0; ciHigh = 0; forecastColor = '#22c55e';
  trendText = ''; trendColor = '#22c55e'; trendIcon = 'fa-arrow-right'; accuracy = 87;
  private chart: any;

  ngOnInit() { this.calcForecastStats(); }
  ngAfterViewInit() { setTimeout(() => this.renderChart(), 300); }
  ngOnDestroy() { this.chart?.dispose(); }

  updateForecast() { this.calcForecastStats(); this.renderChart(); }

  calcForecastStats() {
    const base = 60 + Math.random() * 80;
    const spread = this.horizon * 0.8;
    this.forecastValue = Math.round(base);
    this.ciLow = Math.round(base - spread);
    this.ciHigh = Math.round(base + spread);
    this.forecastColor = base > 150 ? '#ef4444' : base > 100 ? '#f97316' : base > 50 ? '#eab308' : '#22c55e';
    const delta = Math.random() * 30 - 15;
    this.trendText = delta > 5 ? `Tăng ${Math.round(delta)}` : delta < -5 ? `Giảm ${Math.round(Math.abs(delta))}` : 'Ổn định';
    this.trendColor = delta > 5 ? '#ef4444' : delta < -5 ? '#22c55e' : '#eab308';
    this.trendIcon = delta > 5 ? 'fa-arrow-up' : delta < -5 ? 'fa-arrow-down' : 'fa-arrows-alt-h';
    this.accuracy = Math.round(92 - this.horizon * 0.15 + Math.random() * 5);
  }

  renderChart() {
    if (!this.chartEl?.nativeElement || typeof echarts === 'undefined') return;
    if (!this.chart) this.chart = echarts.init(this.chartEl.nativeElement);
    const n = this.horizon; const now = Date.now();
    const times = Array.from({ length: n + 12 }, (_, i) => { const d = new Date(now + (i - 12) * 3600000); return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); });
    const base = 60 + Math.random() * 50;
    const actual = Array.from({ length: 12 }, () => Math.round(base + (Math.random() - 0.5) * 40));
    const predicted = Array.from({ length: n }, () => Math.round(base + (Math.random() - 0.3) * 50));
    const upper = predicted.map((v, i) => Math.round(v + 10 + i * 0.5));
    const lower = predicted.map((v, i) => Math.round(Math.max(0, v - 10 - i * 0.5)));

    this.chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 } },
      grid: { left: '3%', right: '3%', bottom: '12%', top: '5%', containLabel: true },
      xAxis: { type: 'category', data: times, axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } },
        splitArea: { show: true, areaStyle: { color: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ...Array(n).fill('rgba(56,189,248,0.02)')] } } },
      yAxis: { type: 'value', name: this.selectedParam.toUpperCase(), axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.3)', type: 'dashed' } } },
      series: [
        { name: 'Thực tế', type: 'line', data: [...actual, ...Array(n).fill(null)], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#38bdf8' }, itemStyle: { color: '#38bdf8' } },
        { name: 'Dự báo', type: 'line', data: [...Array(12).fill(null), ...predicted], smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#22c55e', type: 'dashed' } },
        { name: 'CI Upper', type: 'line', data: [...Array(12).fill(null), ...upper], smooth: true, symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(34,197,94,.12)' }, stack: 'ci' },
        { name: 'CI Lower', type: 'line', data: [...Array(12).fill(null), ...lower], smooth: true, symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(34,197,94,.12)' }, stack: 'ci' }
      ]
    });
    window.addEventListener('resize', () => this.chart?.resize());
  }
}
