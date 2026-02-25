import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AqiService } from '../../core/services/aqi.service';
import { StationService } from '../../core/services/station.service';
import { AlertService } from '../../core/services/alert.service';
import { AqiReading, Station, Alert } from '../../core/models';
import { getAqiColor, getAqiLabel, getAqiLevelClass } from '../../core/mock-data';
import * as d3 from 'd3';

declare var echarts: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard Tổng Quan</h1>
          <p>Giám sát chất lượng không khí thành phố Hà Nội · Cập nhật: {{ lastUpdate }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="refreshData()">
            <i class="fas fa-sync-alt" [class.fa-spin]="refreshing"></i> Làm mới
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-aqi">
          <div class="kpi-icon"><i class="fas fa-wind"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">AQI Trung bình TP</span>
            <span class="kpi-value" [style.color]="getAqiColor(avgAqi)">{{ avgAqi }}</span>
            <span class="aqi-badge" [ngClass]="getAqiLevelClass(avgAqi)">{{ getAqiLabel(avgAqi) }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fas fa-check-circle"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Trạm đạt chuẩn</span>
            <span class="kpi-value">{{ goodStations }}/{{ totalOnline }}</span>
            <span class="kpi-sub">{{ goodPercent }}% đạt AQI ≤ 100</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Cảnh báo đang xử lý</span>
            <span class="kpi-value">{{ activeAlertCount }}</span>
            <span class="kpi-sub">{{ criticalCount }} nghiêm trọng</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon purple"><i class="fas fa-broadcast-tower"></i></div>
          <div class="kpi-body">
            <span class="kpi-label">Trạm hoạt động</span>
            <span class="kpi-value">{{ totalOnline }}/{{ totalStations }}</span>
            <span class="kpi-sub">{{ offlineCount }} offline · {{ maintenanceCount }} bảo trì</span>
          </div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-row">
        <div class="chart-card large">
          <div class="card-header">
            <h3><i class="fas fa-chart-line"></i> AQI 24 giờ qua</h3>
            <div class="legend">
              <span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>Toàn TP</span>
              <span class="legend-item"><span class="legend-dot" style="background:#a78bfa"></span>Nội thành</span>
            </div>
          </div>
          <div #aqiChart class="chart-container" style="height: 320px;"></div>
        </div>

        <div class="chart-card small">
          <div class="card-header">
            <h3><i class="fas fa-smog"></i> Chất ô nhiễm chính</h3>
          </div>
          <div #pollutionChart class="chart-container" style="height: 320px;"></div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-row-half">
        <div class="chart-card">
          <div class="card-header">
            <h3><i class="fas fa-calendar-alt"></i> Tần suất Ô nhiễm theo Giờ (D3.js)</h3>
          </div>
          <div #calendarHeatmap class="chart-container" style="height: 400px; position: relative;"></div>
        </div>

        <div class="chart-card">
          <div class="card-header">
            <h3><i class="fas fa-trophy"></i> Biến động PM2.5 Top 10 Trạm (Bar Race)</h3>
          </div>
          <div #barRaceChart class="chart-container" style="height: 400px;"></div>
        </div>
      </div>

      <!-- Station Cards -->
      <div class="section-block">
        <div class="section-header">
          <h3><i class="fas fa-map-marker-alt"></i> Trạm quan trắc AQI</h3>
          <a routerLink="/monitoring/realtime" class="view-all">Xem tất cả <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="station-grid">
          <div *ngFor="let reading of currentReadings.slice(0, 8); let i = index"
               class="station-card animate-slide-in"
               [style.animation-delay]="i * 60 + 'ms'"
               [routerLink]="['/monitoring/station', reading.stationId]">
            <div class="station-top">
              <span class="station-name">{{ reading.stationName }}</span>
              <span class="status-dot online"></span>
            </div>
            <div class="station-aqi" [style.color]="getAqiColor(reading.aqi)">{{ reading.aqi }}</div>
            <span class="aqi-badge" [ngClass]="getAqiLevelClass(reading.aqi)">{{ getAqiLabel(reading.aqi) }}</span>
            <div class="station-pollutants">
              <span>PM2.5: {{ reading.pm25 }}</span>
              <span>PM10: {{ reading.pm10 }}</span>
              <span>CO: {{ reading.co }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div class="section-block">
        <div class="section-header">
          <h3><i class="fas fa-bell"></i> Cảnh báo mới nhất</h3>
          <a routerLink="/alerts/active" class="view-all">Xem tất cả <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="alerts-list">
          <div *ngFor="let alert of recentAlerts" class="alert-row">
            <div class="alert-icon-box" [ngClass]="'level-' + alert.level">
              <i [class]="getAlertIcon(alert.level)"></i>
            </div>
            <div class="alert-body">
              <p class="alert-msg">{{ alert.message }}</p>
              <span class="alert-meta">{{ alert.stationName }} · {{ getTimeAgo(alert.timestamp) }}</span>
            </div>
            <span class="alert-level-badge" [ngClass]="'badge-' + alert.level">{{ alert.level | uppercase }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="dashboard-footer">
        <p>© 2025 Urban Air · Dữ liệu từ {{ totalStations }} trạm quan trắc · IoT Sensors · AI/ML Forecast · Realtime MQTT</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-family: 'Outfit'; font-size: 26px; font-weight: 700; color: #f1f5f9; }
    .page-header p { color: #64748b; font-size: 13px; margin-top: 4px; }
    .btn-refresh {
      background: rgba(30,41,59,0.8); border: 1px solid #334155; color: #94a3b8;
      padding: 10px 18px; border-radius: 10px; cursor: pointer; font-size: 13px;
      font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
    }
    .btn-refresh:hover { border-color: #38bdf8; color: #38bdf8; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      background: rgba(30,41,59,0.6); backdrop-filter: blur(10px);
      border: 1px solid rgba(51,65,85,0.4); border-radius: 16px;
      padding: 20px; display: flex; align-items: flex-start; gap: 16px;
      transition: all 0.3s;
    }
    .kpi-card:hover { border-color: rgba(56,189,248,0.3); transform: translateY(-2px); }
    .kpi-icon {
      width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center;
      justify-content: center; font-size: 20px; flex-shrink: 0;
      background: rgba(56,189,248,0.1); color: #38bdf8;
    }
    .kpi-icon.green { background: rgba(34,197,94,0.1); color: #22c55e; }
    .kpi-icon.orange { background: rgba(249,115,22,0.1); color: #f97316; }
    .kpi-icon.purple { background: rgba(139,92,246,0.1); color: #a78bfa; }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-label { font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
    .kpi-value { font-family: 'Outfit'; font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1.1; }
    .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }

    .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .charts-row-full { display: flex; flex-direction: column; margin-bottom: 24px; }
    .charts-row-half { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .chart-card {
      background: rgba(30,41,59,0.6); border: 1px solid rgba(51,65,85,0.4);
      border-radius: 16px; padding: 20px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-family: 'Outfit'; font-size: 15px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .card-header h3 i { color: #38bdf8; font-size: 14px; }
    .legend { display: flex; gap: 16px; }
    .legend-item { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }

    .section-block { margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { font-family: 'Outfit'; font-size: 16px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .section-header h3 i { color: #38bdf8; }
    .view-all { color: #38bdf8; font-size: 13px; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px; }

    .station-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .station-card {
      background: rgba(30,41,59,0.6); border: 1px solid rgba(51,65,85,0.4);
      border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.3s;
    }
    .station-card:hover { border-color: rgba(56,189,248,0.4); transform: translateY(-2px); }
    .station-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .station-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .station-aqi { font-family: 'Outfit'; font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
    .station-pollutants { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .station-pollutants span {
      font-size: 11px; color: #64748b; background: rgba(51,65,85,0.4);
      padding: 2px 8px; border-radius: 6px;
    }

    .alerts-list { display: flex; flex-direction: column; gap: 8px; }
    .alert-row {
      display: flex; align-items: center; gap: 14px; background: rgba(30,41,59,0.6);
      border: 1px solid rgba(51,65,85,0.4); border-radius: 12px; padding: 14px 18px;
      transition: all 0.2s;
    }
    .alert-row:hover { border-color: rgba(56,189,248,0.3); }
    .alert-icon-box {
      width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
      justify-content: center; font-size: 16px; flex-shrink: 0;
    }
    .alert-icon-box.level-critical { background: rgba(239,68,68,0.15); color: #ef4444; }
    .alert-icon-box.level-warning { background: rgba(249,115,22,0.15); color: #f97316; }
    .alert-icon-box.level-info { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .alert-icon-box.level-emergency { background: rgba(153,27,27,0.15); color: #fca5a5; }
    .alert-body { flex: 1; }
    .alert-msg { font-size: 13px; color: #e2e8f0; font-weight: 500; }
    .alert-meta { font-size: 11px; color: #64748b; margin-top: 2px; display: block; }
    .alert-level-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    }
    .badge-critical { background: rgba(239,68,68,0.15); color: #ef4444; }
    .badge-warning { background: rgba(249,115,22,0.15); color: #f97316; }
    .badge-info { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .badge-emergency { background: rgba(153,27,27,0.2); color: #fca5a5; }

    .dashboard-footer { text-align: center; padding: 24px; color: #475569; font-size: 12px; border-top: 1px solid rgba(51,65,85,0.3); margin-top: 16px; }

    @media (max-width: 1200px) { .kpi-grid, .station-grid { grid-template-columns: repeat(2, 1fr); } .charts-row, .charts-row-half { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .kpi-grid, .station-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('aqiChart') aqiChartEl!: ElementRef;
  @ViewChild('pollutionChart') pollutionChartEl!: ElementRef;
  @ViewChild('barRaceChart') barRaceChartEl!: ElementRef;
  @ViewChild('calendarHeatmap') calendarHeatmapEl!: ElementRef;

  currentReadings: AqiReading[] = [];
  stations: Station[] = [];
  recentAlerts: Alert[] = [];
  lastUpdate = '';
  refreshing = false;

  avgAqi = 0;
  totalStations = 0;
  totalOnline = 0;
  goodStations = 0;
  goodPercent = 0;
  offlineCount = 0;
  maintenanceCount = 0;
  activeAlertCount = 0;
  criticalCount = 0;

  private subs: Subscription[] = [];
  private aqiChartInstance: any;
  private pollutionChartInstance: any;
  private barRaceChartInstance: any;
  private barRaceInterval: any;
  private resizeListenerBound = false;

  getAqiColor = getAqiColor;
  getAqiLabel = getAqiLabel;
  getAqiLevelClass = getAqiLevelClass;

  constructor(
    private aqiService: AqiService,
    private stationService: StationService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.loadData();
    this.subs.push(interval(60000).subscribe(() => this.refreshData()));
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.barRaceInterval) clearInterval(this.barRaceInterval);
    if (this.resizeListenerBound) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  onResize = () => {
    this.aqiChartInstance?.resize();
    this.pollutionChartInstance?.resize();
    this.barRaceChartInstance?.resize();
    this.createCalendarHeatmap();
  };

  loadData() {
    this.lastUpdate = new Date().toLocaleTimeString('vi-VN');
    this.stationService.getStations().subscribe(stations => {
      this.stations = stations;
      this.totalStations = stations.length;
      this.totalOnline = stations.filter(s => s.status === 'online').length;
      this.offlineCount = stations.filter(s => s.status === 'offline').length;
      this.maintenanceCount = stations.filter(s => s.status === 'maintenance').length;
    });
    this.aqiService.getCurrentAqi().subscribe(readings => {
      this.currentReadings = readings.sort((a, b) => b.aqi - a.aqi);
      this.avgAqi = Math.round(readings.reduce((s, r) => s + r.aqi, 0) / readings.length);
      this.goodStations = readings.filter(r => r.aqi <= 100).length;
      this.goodPercent = Math.round((this.goodStations / readings.length) * 100);
      if (typeof echarts !== 'undefined') this.updateCharts();
    });
    this.alertService.getActiveAlerts().subscribe(alerts => {
      this.activeAlertCount = alerts.length;
      this.criticalCount = alerts.filter(a => a.level === 'critical' || a.level === 'emergency').length;
    });
    this.alertService.getRecentAlerts(5).subscribe(alerts => this.recentAlerts = alerts);
  }

  refreshData() {
    this.refreshing = true;
    this.loadData();
    setTimeout(() => {
      this.refreshing = false;
      this.updateCharts();
    }, 800);
  }

  initCharts() {
    // Load ECharts from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.onload = () => {
      this.updateCharts();
    };
    if (typeof echarts !== 'undefined') {
      this.updateCharts();
    } else {
      document.head.appendChild(script);
    }

    if (!this.resizeListenerBound) {
      window.addEventListener('resize', this.onResize);
      this.resizeListenerBound = true;
    }
  }

  createAqiChart() {
    if (!this.aqiChartEl?.nativeElement) return;
    this.aqiChartInstance = echarts.getInstanceByDom(this.aqiChartEl.nativeElement) || echarts.init(this.aqiChartEl.nativeElement);
    this.aqiService.getCityAverage24h().subscribe(data => {
      this.aqiChartInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 12 } },
        xAxis: { type: 'category', data: data.hours, axisLabel: { color: '#64748b', fontSize: 11 }, axisLine: { lineStyle: { color: '#334155' } } },
        yAxis: { type: 'value', name: 'AQI', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.3)', type: 'dashed' } } },
        series: [
          { name: 'Toàn TP', type: 'line', smooth: true, symbol: 'none', data: data.cityData, lineStyle: { width: 3, color: '#38bdf8' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(56,189,248,0.2)' }, { offset: 1, color: 'rgba(56,189,248,0)' }] } } },
          { name: 'Nội thành', type: 'line', smooth: true, symbol: 'none', data: data.centerData, lineStyle: { width: 3, color: '#a78bfa' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(167,139,250,0.15)' }, { offset: 1, color: 'rgba(167,139,250,0)' }] } } },
        ],
        visualMap: { show: false, pieces: [{ gt: 0, lte: 50, color: '#22c55e' }, { gt: 50, lte: 100, color: '#eab308' }, { gt: 100, lte: 150, color: '#f97316' }, { gt: 150, lte: 200, color: '#ef4444' }, { gt: 200, color: '#8b5cf6' }] },
      });
    });
  }

  createPollutionChart() {
    if (!this.pollutionChartEl?.nativeElement) return;
    this.pollutionChartInstance = echarts.getInstanceByDom(this.pollutionChartEl.nativeElement) || echarts.init(this.pollutionChartEl.nativeElement);
    const avg = this.currentReadings.length > 0 ? this.currentReadings : [{ pm25: 65, pm10: 95, co: 6, no2: 45, so2: 25, o3: 55 } as any];
    const pm25Avg = Math.round(avg.reduce((s: number, r: any) => s + r.pm25, 0) / avg.length);
    const pm10Avg = Math.round(avg.reduce((s: number, r: any) => s + r.pm10, 0) / avg.length);
    this.pollutionChartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
      legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 }, itemWidth: 10, itemHeight: 10, itemGap: 12 },
      series: [{
        type: 'pie', radius: ['55%', '80%'], center: ['50%', '45%'],
        label: { show: false },
        data: [
          { value: 45, name: 'PM2.5', itemStyle: { color: '#38bdf8' } },
          { value: 30, name: 'PM10', itemStyle: { color: '#a78bfa' } },
          { value: 12, name: 'NO₂', itemStyle: { color: '#22c55e' } },
          { value: 8, name: 'CO', itemStyle: { color: '#fbbf24' } },
          { value: 3, name: 'SO₂', itemStyle: { color: '#f97316' } },
          { value: 2, name: 'O₃', itemStyle: { color: '#ec4899' } },
        ],
        emphasis: { scaleSize: 6 }
      }]
    });
  }

  createBarRaceChart() {
    if (!this.barRaceChartEl?.nativeElement || this.currentReadings.length === 0) return;
    this.barRaceChartInstance = echarts.getInstanceByDom(this.barRaceChartEl.nativeElement) || echarts.init(this.barRaceChartEl.nativeElement);

    // Setup initial data
    const topStations = this.currentReadings.slice(0, 10);
    const names = topStations.map(r => r.stationName || 'Station');
    const values = topStations.map(r => r.pm25);

    const option = {
      backgroundColor: 'transparent',
      grid: { left: '10%', right: '10%', top: '5%', bottom: '10%' },
      xAxis: {
        max: 'dataMax',
        axisLabel: { color: '#64748b' },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        max: 9, // Top 10
        axisLabel: {
          show: true,
          color: '#e2e8f0',
          fontSize: 12
        },
        axisLine: { show: false },
        splitLine: { show: false },
        axisTick: { show: false },
        animationDuration: 300,
        animationDurationUpdate: 300
      },
      series: [
        {
          realtimeSort: true,
          name: 'PM2.5',
          type: 'bar',
          data: values,
          label: {
            show: true,
            position: 'right',
            valueAnimation: true,
            color: '#38bdf8',
            fontWeight: 'bold'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#8b5cf6' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        }
      ],
      animationDuration: 0,
      animationDurationUpdate: 3000,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear'
    };

    this.barRaceChartInstance.setOption(option);

    const updateData = () => {
      const data = option.series[0].data;
      for (let i = 0; i < data.length; ++i) {
        if (Math.random() > 0.9) {
          data[i] += Math.round(Math.random() * 20 - 10);
        } else {
          data[i] += Math.round(Math.random() * 8 - 4);
        }
        if (data[i] < 0) data[i] = 0;
      }
      this.barRaceChartInstance.setOption({
        series: [{ type: 'bar', data: data }]
      });
    };

    if (this.barRaceInterval) clearInterval(this.barRaceInterval);
    this.barRaceInterval = setInterval(() => {
      updateData();
    }, 3000);
  }

  updateCharts() {
    this.createAqiChart();
    this.createPollutionChart();
    this.createBarRaceChart();
    this.createCalendarHeatmap();
  }

  createCalendarHeatmap() {
    if (!this.calendarHeatmapEl?.nativeElement) return;
    const element = this.calendarHeatmapEl.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear prev

    const margin = { top: 20, right: 20, bottom: 20, left: 30 };
    const width = element.clientWidth - margin.left - margin.right || 600 - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom || 400 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => i.toString() + 'h');

    const x = d3.scaleBand().range([0, width]).domain(hours).padding(0.05);
    const y = d3.scaleBand().range([0, height]).domain(days).padding(0.05);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    const myColor = d3.scaleThreshold<number, string>()
      .domain([50, 100, 150, 200])
      .range(['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']);

    const data: { day: string, hour: string, value: number }[] = [];
    days.forEach(day => {
      hours.forEach(hour => {
        let baseValue = 40;
        const h = parseInt(hour, 10);
        if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) {
          baseValue += 60 + Math.random() * 50;
        } else if (day === 'T7' || day === 'CN') {
          baseValue += 10 + Math.random() * 30;
        } else {
          baseValue += Math.random() * 40;
        }
        data.push({ day, hour, value: Math.round(baseValue) });
      });
    });

    const tooltip = d3.select(element)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', '#1e293b')
      .style('border', '1px solid #334155')
      .style('border-radius', '5px')
      .style('padding', '8px')
      .style('color', '#e2e8f0')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');

    const mouseover = function (this: any, event: any, d: any) {
      tooltip.style('opacity', 1);
      d3.select(this).style('stroke', '#fff').style('stroke-width', 2).style('opacity', 1);
    }
    const mousemove = function (event: any, d: any) {
      const containerRect = element.getBoundingClientRect();
      const left = event.clientX - containerRect.left + 15;
      const top = event.clientY - containerRect.top - 20;

      tooltip
        .html(`<span>${d.day} lúc ${d.hour}: </span><strong style="color: ${myColor(d.value)}">AQI ${d.value}</strong>`)
        .style('left', left + 'px')
        .style('top', top + 'px');
    }
    const mouseleave = function (this: any, event: any, d: any) {
      tooltip.style('opacity', 0);
      d3.select(this).style('stroke', 'none').style('opacity', 0.8);
    }

    svg.selectAll()
      .data(data, (d: any) => d.day + ':' + d.hour)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.hour) || 0)
      .attr('y', (d: any) => y(d.day) || 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: any) => myColor(d.value))
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    svg.selectAll('.tick text').style('fill', '#94a3b8').style('font-family', 'DM Sans');
  }

  getAlertIcon(level: string): string {
    return { critical: 'fas fa-exclamation-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle', emergency: 'fas fa-radiation' }[level] || 'fas fa-bell';
  }

  getTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  }
}
