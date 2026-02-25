import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_STATIONS } from '../../../core/mock-data/stations.mock';
import { ExportService } from '../../../core/services/export.service';
declare var echarts: any;

@Component({
  selector: 'app-analytics-compliance', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-check-double"></i> Tuân thủ Quy chuẩn</h1>
    <p>Thống kê tuân thủ QCVN 05:2023/BTNMT · WHO 2021 · EU Directive</p></div>
    <div class="hdr-acts"><select [(ngModel)]="period" (change)="update()" class="sel"><option value="7d">7 ngày</option><option value="30d">30 ngày</option><option value="90d">90 ngày</option><option value="1y">1 năm</option></select>
      <button class="btn-export" (click)="exportReport()"><i class="fas fa-file-pdf"></i> Xuất báo cáo</button></div></div>

    <div class="kpi-row">
      <div class="kpi good"><span class="kl">QCVN đạt chuẩn</span><span class="kv">{{qcvnPct}}%</span><span class="kd">Thời gian đạt chuẩn</span></div>
      <div class="kpi warn"><span class="kl">WHO đạt chuẩn</span><span class="kv">{{whoPct}}%</span><span class="kd">Strict hơn QCVN</span></div>
      <div class="kpi info"><span class="kl">EU đạt chuẩn</span><span class="kv">{{euPct}}%</span><span class="kd">EU Directive 2008/50/EC</span></div>
      <div class="kpi alert"><span class="kl">Số lần vượt ngưỡng</span><span class="kv">{{violations}}</span><span class="kd">Trong kỳ đánh giá</span></div>
    </div>

    <div class="chart-row">
      <div class="chart-card"><h3><i class="fas fa-chart-bar"></i> % Thời gian Đạt chuẩn theo Trạm</h3><div #complianceChart style="height:350px"></div></div>
      <div class="chart-card"><h3><i class="fas fa-ruler-combined"></i> Ngưỡng so sánh (µg/m³)</h3>
        <table class="std-table"><thead><tr><th>Chỉ tiêu</th><th>QCVN 05:2023</th><th>WHO 2021</th><th>EU Directive</th><th>Hiện tại TB</th><th>Đánh giá</th></tr></thead>
          <tbody><tr *ngFor="let s of standards"><td class="bold">{{s.param}}</td><td>{{s.qcvn}}</td><td>{{s.who}}</td><td>{{s.eu}}</td>
            <td [style.color]="s.current>s.qcvn?'#ef4444':'#22c55e'" class="bold">{{s.current}}</td>
            <td><span class="eval-badge" [ngClass]="s.current<=s.who?'pass':s.current<=s.qcvn?'marginal':'fail'">{{s.current<=s.who?'Đạt WHO':s.current<=s.qcvn?'Đạt QCVN':'Vượt'}}</span></td>
          </tr></tbody></table>
      </div>
    </div>

    <div class="chart-card full"><h3><i class="fas fa-calendar-alt"></i> Timeline Vượt ngưỡng (30 ngày gần nhất)</h3><div #timelineChart style="height:200px"></div></div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#22c55e}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:8px}.sel{background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:10px;font-size:12px}
    .btn-export{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
    .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
    .kpi{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:18px;text-align:center}.kl{display:block;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}.kv{display:block;font-family:'Outfit';font-size:32px;font-weight:900;margin:6px 0}.kd{font-size:10px;color:#64748b}
    .kpi.good{border-bottom:3px solid #22c55e}.kpi.good .kv{color:#22c55e}.kpi.warn{border-bottom:3px solid #eab308}.kpi.warn .kv{color:#eab308}.kpi.info{border-bottom:3px solid #38bdf8}.kpi.info .kv{color:#38bdf8}.kpi.alert{border-bottom:3px solid #ef4444}.kpi.alert .kv{color:#ef4444}
    .chart-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px}.chart-card.full{margin-bottom:14px}.chart-card h3{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-card h3 i{color:#38bdf8;font-size:13px}
    .std-table{width:100%;border-collapse:collapse;font-size:12px}thead th{background:rgba(15,23,42,.6);color:#94a3b8;padding:8px;text-align:center;font-size:10px;text-transform:uppercase}tbody td{padding:8px;color:#cbd5e1;border-bottom:1px solid rgba(51,65,85,.2);text-align:center}.bold{font-weight:700}
    .eval-badge{padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700}.eval-badge.pass{background:rgba(34,197,94,.1);color:#22c55e}.eval-badge.marginal{background:rgba(234,179,8,.1);color:#eab308}.eval-badge.fail{background:rgba(239,68,68,.1);color:#ef4444}
    @media(max-width:900px){.kpi-row{grid-template-columns:1fr 1fr}.chart-row{grid-template-columns:1fr}}`]
})
export class AnalyticsComplianceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('complianceChart') compChartEl!: ElementRef;
  @ViewChild('timelineChart') timeChartEl!: ElementRef;
  period = '30d'; qcvnPct = 87; whoPct = 62; euPct = 71; violations = 23;
  standards = [
    { param: 'PM2.5 (24h TB)', qcvn: 50, who: 15, eu: 25, current: 38 },
    { param: 'PM10 (24h TB)', qcvn: 100, who: 45, eu: 50, current: 62 },
    { param: 'NO₂ (1h TB)', qcvn: 200, who: 25, eu: 200, current: 42 },
    { param: 'SO₂ (24h TB)', qcvn: 125, who: 40, eu: 125, current: 28 },
    { param: 'O₃ (8h TB)', qcvn: 120, who: 100, eu: 120, current: 78 },
    { param: 'CO (8h TB)', qcvn: 10000, who: 4000, eu: 10000, current: 2800 },
  ];
  private charts: any[] = [];
  constructor(private exportSvc: ExportService) {}

  ngAfterViewInit() { setTimeout(() => { this.renderCompliance(); this.renderTimeline(); }, 300); }
  ngOnDestroy() { this.charts.forEach(c => c?.dispose()); }
  update() {
    const factor = this.period === '7d' ? 1.1 : this.period === '90d' ? 0.95 : this.period === '1y' ? 0.9 : 1;
    this.qcvnPct = Math.round(87 * factor); this.whoPct = Math.round(62 * factor); this.euPct = Math.round(71 * factor);
    this.renderCompliance(); this.renderTimeline();
  }

  renderCompliance() {
    if (!this.compChartEl?.nativeElement || typeof echarts === 'undefined') return;
    let c = this.charts[0]; if (!c) { c = echarts.init(this.compChartEl.nativeElement); this.charts[0] = c; }
    const stations = MOCK_STATIONS.slice(0, 10).map(s => s.name.replace('Trạm ', ''));
    c.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 10 } }, grid: { left: '3%', right: '3%', bottom: '14%', top: '5%', containLabel: true },
      xAxis: { type: 'category', data: stations, axisLabel: { color: '#64748b', fontSize: 10, rotate: 30 } },
      yAxis: { type: 'value', max: 100, name: '%', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)', type: 'dashed' } } },
      series: [
        { name: 'QCVN', type: 'bar', barWidth: 12, itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] }, data: stations.map(() => Math.round(75 + Math.random() * 20)) },
        { name: 'WHO', type: 'bar', barWidth: 12, itemStyle: { color: '#eab308', borderRadius: [4, 4, 0, 0] }, data: stations.map(() => Math.round(45 + Math.random() * 30)) },
        { name: 'EU', type: 'bar', barWidth: 12, itemStyle: { color: '#38bdf8', borderRadius: [4, 4, 0, 0] }, data: stations.map(() => Math.round(55 + Math.random() * 25)) },
      ]
    });
  }

  renderTimeline() {
    if (!this.timeChartEl?.nativeElement || typeof echarts === 'undefined') return;
    let c = this.charts[1]; if (!c) { c = echarts.init(this.timeChartEl.nativeElement); this.charts[1] = c; }
    const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); });
    c.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis' }, grid: { left: '3%', right: '3%', bottom: '5%', top: '5%', containLabel: true },
      xAxis: { type: 'category', data: days, axisLabel: { color: '#64748b', fontSize: 9 } },
      yAxis: { type: 'value', name: 'Lần vượt', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)' } } },
      series: [{ type: 'bar', data: days.map(() => Math.floor(Math.random() * 5)), itemStyle: { color: (p: any) => p.data > 2 ? '#ef4444' : p.data > 0 ? '#eab308' : '#22c55e', borderRadius: [3, 3, 0, 0] }, barWidth: 14 }]
    });
  }

  exportReport() {
    const rows = this.standards.map(s => `<tr><td>${s.param}</td><td>${s.qcvn}</td><td>${s.who}</td><td>${s.eu}</td><td>${s.current}</td></tr>`).join('');
    this.exportSvc.exportPdf('Báo cáo Tuân thủ Quy chuẩn', `<p>Kỳ đánh giá: ${this.period}</p>
      <p>QCVN: ${this.qcvnPct}% | WHO: ${this.whoPct}% | EU: ${this.euPct}% | Vi phạm: ${this.violations} lần</p>
      <table><thead><tr><th>Chỉ tiêu</th><th>QCVN</th><th>WHO</th><th>EU</th><th>Hiện tại</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
}
