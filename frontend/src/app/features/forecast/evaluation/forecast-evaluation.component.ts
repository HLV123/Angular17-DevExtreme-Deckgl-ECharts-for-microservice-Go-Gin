import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_ML_MODELS } from '../../../core/mock-data/others.mock';
import { ExportService } from '../../../core/services/export.service';
declare var echarts: any;

@Component({
  selector: 'app-forecast-evaluation', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-chart-radar"></i> Đánh giá Mô hình AI/ML</h1>
    <p>So sánh hiệu suất {{models.length}} mô hình dự báo</p></div>
    <div class="hdr-acts"><button class="btn-export" (click)="exportReport()"><i class="fas fa-file-pdf"></i> Xuất báo cáo</button></div></div>

    <div class="eval-grid">
      <!-- Radar Chart -->
      <div class="chart-card"><h3><i class="fas fa-spider"></i> So sánh Đa chỉ số</h3><div #radarChart style="height:340px"></div></div>
      <!-- Metrics Table -->
      <div class="chart-card"><h3><i class="fas fa-table"></i> Bảng Metrics Chi tiết</h3>
        <table class="mtbl"><thead><tr><th>Mô hình</th><th>RMSE</th><th>MAE</th><th>R²</th><th>MAPE</th><th>Speed</th><th>Rank</th></tr></thead>
          <tbody><tr *ngFor="let m of models; let i=index" [class.best]="i===0">
            <td><span class="m-algo">{{m.algorithm}}</span><span class="m-ver">{{m.version}}</span></td>
            <td [class.best-val]="m.metrics.rmse===bestRmse">{{m.metrics.rmse}}</td>
            <td [class.best-val]="m.metrics.mae===bestMae">{{m.metrics.mae}}</td>
            <td [class.best-val]="m.metrics.r2===bestR2">{{m.metrics.r2}}</td>
            <td>{{m.metrics.mape}}%</td>
            <td>{{speeds[i]}}ms</td>
            <td><span class="rank-badge" [ngClass]="'r-'+(i+1)">#{{i+1}}</span></td>
          </tr></tbody></table></div>
    </div>

    <div class="eval-grid mt">
      <!-- Residual Plot -->
      <div class="chart-card"><h3><i class="fas fa-braille"></i> Residual Plot (Predicted vs Actual)</h3><div #residualChart style="height:300px"></div></div>
      <!-- SHAP Feature Importance -->
      <div class="chart-card"><h3><i class="fas fa-sort-amount-down"></i> SHAP Feature Importance</h3><div #shapChart style="height:300px"></div></div>
    </div>

    <div class="insight-cards">
      <div class="ins-card good"><i class="fas fa-trophy"></i><div><b>Mô hình tốt nhất</b><p>{{models[0].algorithm}} {{models[0].version}} đạt R²={{models[0].metrics.r2}}, phù hợp cho production</p></div></div>
      <div class="ins-card info"><i class="fas fa-flask"></i><div><b>A/B Testing</b><p>LSTM v3 đang được so sánh song song với XGBoost. Sau 14 ngày, LSTM có accuracy cao hơn 2.3%</p></div></div>
      <div class="ins-card warn"><i class="fas fa-exclamation-triangle"></i><div><b>Cảnh báo Drift</b><p>SARIMA đang giảm accuracy 5% so với tháng trước. Cần retrain với dữ liệu mới</p></div></div>
    </div></div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .btn-export{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
    .eval-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.eval-grid.mt{margin-top:14px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px}.chart-card h3{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-card h3 i{color:#38bdf8;font-size:13px}
    .mtbl{width:100%;border-collapse:collapse;font-size:12px}.mtbl th{background:rgba(15,23,42,.6);color:#94a3b8;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px}.mtbl td{padding:8px 10px;color:#cbd5e1;border-bottom:1px solid rgba(51,65,85,.3)}.mtbl tr.best{background:rgba(34,197,94,.05)}.best-val{color:#22c55e !important;font-weight:700}
    .m-algo{font-weight:700;color:#f1f5f9;display:block}.m-ver{font-size:10px;color:#64748b}
    .rank-badge{padding:3px 8px;border-radius:6px;font-size:10px;font-weight:800}.r-1{background:rgba(234,179,8,.15);color:#eab308}.r-2{background:rgba(192,192,192,.1);color:#94a3b8}.r-3{background:rgba(205,127,50,.1);color:#cd7f32}.r-4,.r-5{background:rgba(51,65,85,.2);color:#64748b}
    .insight-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.ins-card{display:flex;gap:12px;padding:16px;border-radius:14px;align-items:flex-start}.ins-card i{font-size:18px;margin-top:2px}.ins-card b{display:block;font-family:'Outfit';font-size:13px;color:#f1f5f9;margin-bottom:4px}.ins-card p{font-size:11px;color:#94a3b8;line-height:1.4;margin:0}
    .ins-card.good{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15)}.ins-card.good i{color:#22c55e}
    .ins-card.info{background:rgba(56,189,248,.06);border:1px solid rgba(56,189,248,.15)}.ins-card.info i{color:#38bdf8}
    .ins-card.warn{background:rgba(234,179,8,.06);border:1px solid rgba(234,179,8,.15)}.ins-card.warn i{color:#eab308}
    .hdr-acts{display:flex;gap:8px}
    @media(max-width:900px){.eval-grid,.insight-cards{grid-template-columns:1fr}}`]
})
export class ForecastEvaluationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('radarChart') radarEl!: ElementRef;
  @ViewChild('residualChart') residualEl!: ElementRef;
  @ViewChild('shapChart') shapEl!: ElementRef;
  models = [...MOCK_ML_MODELS].sort((a, b) => b.metrics.r2 - a.metrics.r2);
  speeds = [120, 45, 15, 38, 22];
  bestRmse = Math.min(...this.models.map(m => m.metrics.rmse));
  bestMae = Math.min(...this.models.map(m => m.metrics.mae));
  bestR2 = Math.max(...this.models.map(m => m.metrics.r2));
  private charts: any[] = [];
  constructor(private exportSvc: ExportService) {}

  ngAfterViewInit() { setTimeout(() => { this.renderRadar(); this.renderResidual(); this.renderShap(); }, 300); }
  ngOnDestroy() { this.charts.forEach(c => c?.dispose()); }

  renderRadar() {
    if (!this.radarEl?.nativeElement || typeof echarts === 'undefined') return;
    const c = echarts.init(this.radarEl.nativeElement); this.charts.push(c);
    const colors = ['#38bdf8', '#22c55e', '#f97316', '#a78bfa', '#ef4444'];
    c.setOption({ backgroundColor: 'transparent', legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 10 } },
      radar: { indicator: [{ name: 'Accuracy', max: 1 }, { name: '1/RMSE', max: 1 }, { name: '1/MAE', max: 1 }, { name: '1/MAPE', max: 1 }, { name: 'Speed', max: 1 }],
        shape: 'polygon', axisName: { color: '#94a3b8', fontSize: 10 }, splitArea: { areaStyle: { color: ['rgba(15,23,42,.2)', 'rgba(15,23,42,.4)'] } }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.4)' } } },
      series: [{ type: 'radar', data: this.models.map((m, i) => ({
        name: m.algorithm, value: [m.metrics.r2, 1 / (1 + m.metrics.rmse), 1 / (1 + m.metrics.mae), 1 / (1 + m.metrics.mape), 1 / (1 + this.speeds[i] / 100)],
        lineStyle: { color: colors[i] }, itemStyle: { color: colors[i] }, areaStyle: { color: colors[i], opacity: 0.08 }
      })) }]
    });
  }

  renderResidual() {
    if (!this.residualEl?.nativeElement || typeof echarts === 'undefined') return;
    const c = echarts.init(this.residualEl.nativeElement); this.charts.push(c);
    const data = Array.from({ length: 100 }, () => [50 + Math.random() * 150, (Math.random() - 0.5) * 40]);
    c.setOption({ backgroundColor: 'transparent', tooltip: { formatter: (p: any) => `Predicted: ${p.data[0].toFixed(1)}<br>Residual: ${p.data[1].toFixed(1)}` },
      grid: { left: '8%', right: '5%', bottom: '12%', top: '5%' },
      xAxis: { name: 'Predicted AQI', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)' } } },
      yAxis: { name: 'Residual', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)', type: 'dashed' } } },
      series: [{ type: 'scatter', data, symbolSize: 6, itemStyle: { color: '#38bdf8', opacity: 0.6 } },
        { type: 'line', markLine: { data: [{ yAxis: 0 }], lineStyle: { color: '#ef4444', type: 'dashed' }, label: { show: false } }, data: [] }]
    });
  }

  renderShap() {
    if (!this.shapEl?.nativeElement || typeof echarts === 'undefined') return;
    const c = echarts.init(this.shapEl.nativeElement); this.charts.push(c);
    const features = ['PM2.5 (t-1)', 'Humidity', 'Wind Speed', 'Temperature', 'PM10 (t-1)', 'Traffic Index', 'Hour of Day', 'NO₂ (t-1)', 'Pressure', 'Day of Week'];
    const values = [0.42, 0.28, 0.19, 0.17, 0.14, 0.11, 0.09, 0.07, 0.05, 0.03];
    c.setOption({ backgroundColor: 'transparent', tooltip: {},
      grid: { left: '25%', right: '8%', bottom: '5%', top: '3%' },
      xAxis: { type: 'value', name: 'SHAP Value', axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.2)' } } },
      yAxis: { type: 'category', data: [...features].reverse(), axisLabel: { color: '#cbd5e1', fontSize: 10 } },
      series: [{ type: 'bar', data: [...values].reverse(), barWidth: 16, itemStyle: {
        color: (p: any) => { const v = p.data; return v > 0.2 ? '#ef4444' : v > 0.1 ? '#f97316' : '#38bdf8'; }, borderRadius: [0, 4, 4, 0] } }]
    });
  }

  exportReport() {
    const rows = this.models.map(m => `<tr><td>${m.algorithm}</td><td>${m.metrics.rmse}</td><td>${m.metrics.mae}</td><td>${m.metrics.r2}</td><td>${m.metrics.mape}%</td></tr>`).join('');
    this.exportSvc.exportPdf('Báo cáo Đánh giá Mô hình AI/ML', `<p>Ngày: ${new Date().toLocaleDateString('vi-VN')} · Số mô hình: ${this.models.length}</p>
      <table><thead><tr><th>Mô hình</th><th>RMSE</th><th>MAE</th><th>R²</th><th>MAPE</th></tr></thead><tbody>${rows}</tbody></table>
      <p><b>Kết luận:</b> ${this.models[0].algorithm} đạt hiệu suất cao nhất với R²=${this.models[0].metrics.r2}</p>`);
  }
}
