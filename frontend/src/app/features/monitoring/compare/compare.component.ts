import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { getAqiColor, getAqiLabel } from '../../../core/mock-data';
declare var echarts: any;

@Component({
  selector: 'app-compare', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><h1><i class="fas fa-columns"></i> So sánh Trạm Quan trắc</h1><p>So sánh đa chỉ tiêu giữa các trạm</p></div>
    <div class="sel-row"><div *ngFor="let i of [0,1,2,3]" class="sel-box" [style.borderColor]="colors[i]">
      <label [style.color]="colors[i]">Trạm {{i+1}}</label>
      <select [(ngModel)]="selectedIds[i]" (change)="update()" class="sel"><option value="">-- Chọn --</option>
        <option *ngFor="let s of stations" [value]="s.id">{{s.name}}</option></select>
    </div></div>

    <div class="compare-cards"><div *ngFor="let s of selectedStations; let i=index" class="cmp-card" [style.borderTopColor]="colors[i]">
      <div class="cmp-aqi" [style.color]="getAqiColor(s._aqi)">{{s._aqi}}</div>
      <span class="cmp-level" [style.background]="getAqiColor(s._aqi)+'15'" [style.color]="getAqiColor(s._aqi)">{{getAqiLabel(s._aqi)}}</span>
      <h4>{{s.name}}</h4>
      <div class="poll-grid">
        <div *ngFor="let p of pollutants" class="poll-item"><span class="pl">{{p.label}}</span><span class="pv">{{s['_'+p.key] || '—'}}</span><span class="pu">{{p.unit}}</span></div>
      </div></div></div>

    <div class="chart-row">
      <div class="chart-card"><h3>AQI 24h</h3><div #lineChart style="height:340px"></div></div>
      <div class="chart-card"><h3>So sánh Pollutants</h3><div #barChart style="height:340px"></div></div>
    </div></div>`,
  styles: [`.pg-hdr{margin-bottom:16px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .sel-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.sel-box{background:rgba(30,41,59,.6);border:2px solid rgba(51,65,85,.3);border-radius:12px;padding:10px}.sel-box label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:4px}.sel{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:8px;border-radius:8px;font-size:11px}
    .compare-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px}
    .cmp-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-top:3px solid;border-radius:14px;padding:16px;text-align:center}
    .cmp-aqi{font-family:'Outfit';font-size:42px;font-weight:900;line-height:1}.cmp-level{display:inline-block;padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;margin:6px 0}.cmp-card h4{font-family:'Outfit';font-size:13px;color:#f1f5f9;margin-bottom:10px}
    .poll-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}.poll-item{background:rgba(15,23,42,.4);padding:6px;border-radius:6px;text-align:left}.pl{display:block;font-size:9px;color:#64748b}.pv{font-family:'Outfit';font-size:14px;font-weight:700;color:#e2e8f0}.pu{font-size:9px;color:#64748b}
    .chart-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px}.chart-card h3{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:12px}
    @media(max-width:900px){.sel-row{grid-template-columns:1fr 1fr}.chart-row{grid-template-columns:1fr}}`]
})
export class CompareComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineEl!: ElementRef;
  @ViewChild('barChart') barEl!: ElementRef;
  stations = MOCK_STATIONS.filter(s => s.status === 'online');
  selectedIds: string[] = ['ST001', 'ST002', 'ST003', ''];
  selectedStations: any[] = [];
  colors = ['#38bdf8', '#22c55e', '#f97316', '#a78bfa'];
  getAqiColor = getAqiColor; getAqiLabel = getAqiLabel;
  pollutants = [{key:'pm25',label:'PM2.5',unit:'µg/m³'},{key:'pm10',label:'PM10',unit:'µg/m³'},{key:'co',label:'CO',unit:'mg/m³'},{key:'no2',label:'NO₂',unit:'µg/m³'},{key:'so2',label:'SO₂',unit:'µg/m³'},{key:'o3',label:'O₃',unit:'µg/m³'}];
  private charts: any[] = [];

  ngAfterViewInit() { setTimeout(() => this.update(), 300); }
  ngOnDestroy() { this.charts.forEach(c => c?.dispose()); }

  update() {
    this.selectedStations = this.selectedIds.filter(id => id).map(id => {
      const s: any = { ...this.stations.find(x => x.id === id) };
      s._aqi = 30 + Math.round(Math.random() * 150);
      s._pm25 = (10 + Math.random() * 60).toFixed(1); s._pm10 = (20 + Math.random() * 80).toFixed(1);
      s._co = (0.2 + Math.random() * 2).toFixed(2); s._no2 = (10 + Math.random() * 50).toFixed(1);
      s._so2 = (5 + Math.random() * 30).toFixed(1); s._o3 = (20 + Math.random() * 60).toFixed(1);
      return s;
    });
    this.renderLine(); this.renderBar();
  }

  renderLine() {
    if (!this.lineEl?.nativeElement || typeof echarts === 'undefined') return;
    let c = this.charts[0]; if (!c) { c = echarts.init(this.lineEl.nativeElement); this.charts[0] = c; }
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    c.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 10 } }, grid: { left: '4%', right: '3%', bottom: '14%', top: '5%', containLabel: true },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#64748b', fontSize: 10 } },
      yAxis: { type: 'value', name: 'AQI', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)', type: 'dashed' } } },
      series: this.selectedStations.map((s, i) => ({
        name: s.name, type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 2, color: this.colors[i] },
        data: Array.from({ length: 24 }, () => Math.round(+s._aqi + (Math.random() - 0.5) * 40))
      }))
    });
  }

  renderBar() {
    if (!this.barEl?.nativeElement || typeof echarts === 'undefined') return;
    let c = this.charts[1]; if (!c) { c = echarts.init(this.barEl.nativeElement); this.charts[1] = c; }
    const params = ['PM2.5', 'PM10', 'CO', 'NO₂', 'SO₂', 'O₃'];
    c.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 10 } }, grid: { left: '4%', right: '3%', bottom: '14%', top: '5%', containLabel: true },
      xAxis: { type: 'category', data: params, axisLabel: { color: '#64748b' } },
      yAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)', type: 'dashed' } } },
      series: this.selectedStations.map((s, i) => ({
        name: s.name, type: 'bar', barWidth: 14, itemStyle: { color: this.colors[i], borderRadius: [4, 4, 0, 0] },
        data: [+s._pm25, +s._pm10, +s._co * 50, +s._no2, +s._so2, +s._o3]
      }))
    });
  }
}
