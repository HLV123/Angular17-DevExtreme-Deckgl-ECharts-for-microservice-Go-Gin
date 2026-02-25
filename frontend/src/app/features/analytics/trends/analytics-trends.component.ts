import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxFileUploaderModule } from 'devextreme-angular';
import * as d3 from 'd3';
declare var echarts: any;
@Component({
  selector: 'app-analytics-trends', standalone: true, imports: [CommonModule, DxFileUploaderModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><div><h1><i class="fas fa-chart-line"></i> Phân tích Xu hướng</h1><p>Xu hướng AQI dài hạn và anomaly detection</p></div><div class="hdr-acts"><button class="btn-primary" (click)="showUpload=true"><i class="fas fa-upload"></i> Nhập Dataset (CSV)</button></div></div>
    <div class="chart-card"><h3><i class="fas fa-wave-square"></i> Xu hướng AQI 30 ngày · Hà Nội</h3><div #trendChart style="height:350px"></div></div>
    
    <div class="chart-card">
      <h3><i class="fas fa-calendar-alt"></i> Phân bố AQI theo Giờ & Ngày trong Tuần (D3.js Heatmap)</h3>
      <div class="heatmap-container" #d3Heatmap></div>
    </div>

    <div class="insights-grid"><div class="insight-card"><h4><i class="fas fa-arrow-up"></i> Xu hướng Tăng</h4><p>AQI trung bình tăng 8% trong 30 ngày qua. Đỉnh vào các ngày thứ 5-6 do giao thông cao điểm cuối tuần.</p></div>
      <div class="insight-card"><h4><i class="fas fa-exclamation-triangle"></i> Anomaly Detected</h4><p>3 điểm bất thường được phát hiện: 05/06 (AQI 245 - đốt rơm), 12/06 (AQI 198 - nghịch đảo nhiệt), 18/06 (AQI 210).</p></div>
      <div class="insight-card"><h4><i class="fas fa-sync-alt"></i> Seasonality</h4><p>Pattern rõ ràng: AQI cao nhất 6-8h và 17-19h (giờ cao điểm). Thấp nhất 2-4h sáng. Chu kỳ tuần: cao Thứ 2-6, thấp cuối tuần.</p></div>
      <div class="insight-card"><h4><i class="fas fa-link"></i> Correlation</h4><p>Tương quan mạnh: Nhiệt độ (r=0.65), Độ ẩm (r=-0.42), Tốc độ gió (r=-0.58). Gió >15km/h giảm AQI trung bình 30%.</p></div></div>
      
      <div class="modal-bg" *ngIf="showUpload" (click)="showUpload=false">
        <div class="modal import-modal" (click)="$event.stopPropagation()">
          <div class="mhdr"><h2><i class="fas fa-file-csv"></i> Upload Dataset Phân tích</h2><button (click)="showUpload=false"><i class="fas fa-times"></i></button></div>
          <div class="mbody">
            <p class="desc">Chấp nhận file .CSV chứa dữ liệu lịch sử AQI để phân tích xu hướng mới. Tối đa 20MB.</p>
            <div class="upload-zone">
              <dx-file-uploader
                selectButtonText="Chọn file CSV"
                labelText="hoặc kéo thả file vào đây"
                accept=".csv"
                uploadMode="useButtons"
                [allowedFileExtensions]="['.csv']"
                (onUploaded)="importData($event)">
              </dx-file-uploader>
            </div>
            <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="progress-bar">
              <div class="fill" [style.width]="uploadProgress + '%'"></div>
              <span>{{uploadProgress}}%</span>
            </div>
          </div>
        </div>
      </div>
      </div>`,
  styles: [`.pg-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}.pg-hdr p{color:#64748b;font-size:13px;margin-top:4px}
    .hdr-acts{display:flex;gap:10px}.btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px}
    .chart-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:20px;margin-bottom:18px}.chart-card h3{font-family:'Outfit';font-size:15px;color:#e2e8f0;margin-bottom:14px;display:flex;align-items:center;gap:8px}.chart-card h3 i{color:#38bdf8}
    .insights-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.insight-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:18px}.insight-card h4{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:8px;display:flex;align-items:center;gap:8px}.insight-card h4 i{color:#38bdf8;font-size:13px}.insight-card p{font-size:13px;color:#94a3b8;line-height:1.5}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center}.modal{background:#1e293b;border:1px solid #334155;border-radius:18px;width:560px;max-height:90vh;overflow-y:auto}.mhdr{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #334155}.mhdr h2{font-family:'Outfit';font-size:17px;color:#f1f5f9;display:flex;align-items:center;gap:8px}.mhdr h2 i{color:#38bdf8}.mhdr button{background:none;border:none;color:#64748b;font-size:16px;cursor:pointer}.mbody{padding:22px}
    .import-modal{width:480px}.desc{font-size:13px;color:#94a3b8;line-height:1.5;margin-bottom:20px}.upload-zone{background:rgba(15,23,42,.4);border:1px dashed rgba(56,189,248,.4);border-radius:12px;padding:20px;text-align:center}
    ::ng-deep .dx-fileuploader-button{background:rgba(56,189,248,.1)!important;color:#38bdf8!important;border:1px solid rgba(56,189,248,.3)!important;border-radius:8px!important}::ng-deep .dx-fileuploader-button:hover{background:rgba(56,189,248,.2)!important}::ng-deep .dx-fileuploader-wrapper{color:#e2e8f0!important;font-family:'DM Sans'!important}
    .progress-bar{height:6px;background:rgba(15,23,42,.6);border-radius:3px;margin-top:16px;position:relative;overflow:hidden}.progress-bar .fill{height:100%;background:#22c55e;transition:width .3s}.progress-bar span{position:absolute;top:-20px;right:0;font-size:11px;color:#cbd5e1}
    
    .heatmap-container { width: 100%; height: 350px; overflow-x: auto; overflow-y: hidden; }
    ::ng-deep .heatmap-tooltip { position: absolute; text-align: center; padding: 6px 10px; font: 12px 'Outfit', sans-serif; font-weight: 500; color: #f1f5f9; background: #1e293b; border: 1px solid #334155; border-radius: 8px; pointer-events: none; opacity: 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  `]
})
export class AnalyticsTrendsComponent implements AfterViewInit {
  @ViewChild('trendChart') chartEl!: ElementRef;
  @ViewChild('d3Heatmap') d3HeatmapEl!: ElementRef;
  private chart: any;
  showUpload = false;
  uploadProgress = 0;

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.chartEl?.nativeElement || typeof echarts === 'undefined') return; this.chart = echarts.init(this.chartEl.nativeElement);
      const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); });
      const data = Array.from({ length: 30 }, () => Math.round(70 + Math.random() * 80)); const trend = data.map((_, i) => Math.round(85 + i * 1.2));
      this.chart.setOption({ backgroundColor: 'transparent', tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } }, legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 } }, grid: { left: '3%', right: '3%', bottom: '12%', top: '5%', containLabel: true }, xAxis: { type: 'category', data: days, axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } } }, yAxis: { type: 'value', name: 'AQI', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,.3)', type: 'dashed' } } }, series: [{ name: 'AQI thực tế', type: 'bar', data: data.map(v => ({ value: v, itemStyle: { color: v > 200 ? '#8b5cf6' : v > 150 ? '#ef4444' : v > 100 ? '#f97316' : v > 50 ? '#eab308' : '#22c55e' } })), barWidth: 8 }, { name: 'Xu hướng', type: 'line', data: trend, smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#38bdf8', type: 'dashed' } }] });
      window.addEventListener('resize', () => this.chart?.resize());
    }, 300);

    setTimeout(() => this.drawD3Heatmap(), 400);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.drawD3Heatmap();
  }

  drawD3Heatmap() {
    if (!this.d3HeatmapEl?.nativeElement) return;
    const container = this.d3HeatmapEl.nativeElement;
    d3.select(container).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Remove old tooltip if exists
    d3.select('body').selectAll('.heatmap-tooltip').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);

    // Generate mock data: higher AQI during rush hours (7-9h, 17-19h) and weekdays
    const data: any[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        let base = 50 + Math.random() * 40;
        if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) {
          base += 60 + Math.random() * 50; // Rush hour peak
        }
        if (d >= 5) {
          base -= 30; // Weekend drop
        }
        data.push({ day: days[d], hour: `${h}h`, value: Math.max(20, Math.floor(base)) });
      }
    }

    const x = d3.scaleBand()
      .range([0, width])
      .domain(hours)
      .padding(0.05);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .select('.domain').remove();

    // Style axis text
    svg.selectAll('.tick text')
      .style('fill', '#94a3b8')
      .style('font-family', 'Outfit');

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(days.reverse())
      .padding(0.08);

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    svg.selectAll('.tick text')
      .style('fill', '#94a3b8')
      .style('font-family', 'Outfit');

    const colorScale = d3.scaleLinear<string>()
      .range(['#22c55e', '#eab308', '#ef4444', '#8b5cf6'])
      .domain([0, 50, 100, 200]);

    // Setup tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip');

    svg.selectAll()
      .data(data, function (d: any) { return d.day + ':' + d.hour; })
      .enter()
      .append('rect')
      .attr('x', function (d: any) { return x(d.hour) || 0; })
      .attr('y', function (d: any) { return y(d.day) || 0; })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('class', 'hour-rect')
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', function (d: any) { return colorScale(d.value); })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
      .on('mouseover', function (event: any, d: any) {
        d3.select(this)
          .style('stroke', '#fff')
          .style('opacity', 1);
        tooltip.style('opacity', 1)
          .html(`<strong>${d.day} lúc ${d.hour}</strong><br/>AQI trung bình: ${d.value}`)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseleave', function (d: any) {
        d3.select(this)
          .style('stroke', 'none')
          .style('opacity', 0.8);
        tooltip.style('opacity', 0);
      });
  }

  importData(e: any) {
    this.uploadProgress = 10;
    const interval = setInterval(() => {
      this.uploadProgress += 20;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showUpload = false;
          this.uploadProgress = 0;
          alert('Upload Dataset thành công! Biểu đồ sẽ tự cập nhật khi mô hình phân tích xong.');
        }, 500);
      }
    }, 400);
  }
}
