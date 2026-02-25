import { ExportService } from '../../../core/services/export.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule, DxButtonModule, DxSelectBoxModule, DxDateBoxModule } from 'devextreme-angular';
import { AlertService } from '../../../core/services/alert.service';
import { Alert } from '../../../core/models';
import { TimelineModule } from 'primeng/timeline';
import * as d3 from 'd3';

@Component({
  selector: 'app-alerts-history',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule, DxButtonModule, DxSelectBoxModule, DxDateBoxModule, TimelineModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;"><i class="fas fa-archive text-slate-400"></i> Lịch sử Cảnh báo</h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Lưu trữ {{allAlerts.length}} sự kiện cảnh báo chất lượng không khí & hệ thống.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
      </div>

      <div class="stats-row" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
        <div class="stat" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; text-align:center;">
          <b style="display:block; font-family:'Outfit'; font-size:28px; font-weight:700; color:#f1f5f9;">{{allAlerts.length}}</b>
          <span style="font-size:12px; color:#64748b;">Tổng cảnh báo</span>
        </div>
        <div class="stat" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; text-align:center;">
          <b style="display:block; font-family:'Outfit'; font-size:28px; font-weight:700; color:#22c55e;">{{resolvedCount}}</b>
          <span style="font-size:12px; color:#64748b;">Đã xử lý</span>
        </div>
        <div class="stat" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; text-align:center;">
          <b style="display:block; font-family:'Outfit'; font-size:28px; font-weight:700; color:#eab308;">{{avgResolutionTime}}h</b>
          <span style="font-size:12px; color:#64748b;">TB thời gian xử lý</span>
        </div>
        <div class="stat" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; text-align:center;">
          <b style="display:block; font-family:'Outfit'; font-size:20px; font-weight:700; color:#f1f5f9; line-height:36px;">{{topStation}}</b>
          <span style="font-size:12px; color:#64748b;">Trạm báo nhiều nhất</span>
        </div>
      </div>

      <!-- D3 Calendar Heatmap -->
      <div class="heatmap-card" style="background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-family:'Outfit';font-size:15px;color:#e2e8f0;display:flex;align-items:center;gap:8px;margin-bottom:14px;"><i class="fas fa-calendar-alt" style="color:#38bdf8"></i> Tần suất Cảnh báo theo Giờ & Ngày (D3.js)</h3>
        <div #calendarHeatmap style="height:260px;position:relative;"></div>
      </div>

      <div class="filter-controls" style="display:flex; gap:12px; align-items:center; margin-bottom: 20px; flex-wrap: wrap;">
        <dx-select-box
          [items]="levelOptions"
          displayExpr="text"
          valueExpr="value"
          [(value)]="fLevel"
          [showClearButton]="true"
          placeholder="Tất cả cấp độ"
          (onValueChanged)="applyFilters()"
          width="180">
        </dx-select-box>

        <dx-select-box
          [items]="typeOptions"
          displayExpr="text"
          valueExpr="value"
          [(value)]="fType"
          [showClearButton]="true"
          placeholder="Tất cả loại"
          (onValueChanged)="applyFilters()"
          width="200">
        </dx-select-box>
        
        <div style="display: flex; gap: 8px; align-items: center;">
          <dx-date-box [(value)]="startDate" type="date" placeholder="Từ ngày" (onValueChanged)="applyFilters()" width="150" [showClearButton]="true"></dx-date-box>
          <span style="color: #64748b;">-</span>
          <dx-date-box [(value)]="endDate" type="date" placeholder="Đến ngày" (onValueChanged)="applyFilters()" width="150" [showClearButton]="true"></dx-date-box>
        </div>

        <div class="view-toggle" style="margin-left:auto; display:flex; background:#1e293b; border:1px solid #334155; border-radius:10px; overflow:hidden;">
          <button [class.active]="viewMode==='table'" (click)="viewMode='table'" style="background:none; border:none; padding:8px 16px; font-size:13px; cursor:pointer; font-family:'DM Sans'; font-weight:500;" [ngStyle]="{'color': viewMode==='table' ? '#38bdf8' : '#64748b', 'background': viewMode==='table' ? 'rgba(56,189,248,.1)' : 'transparent'}">
            <i class="fas fa-table" style="margin-right:6px;"></i> Bảng
          </button>
          <button [class.active]="viewMode==='timeline'" (click)="viewMode='timeline'" style="background:none; border:none; padding:8px 16px; font-size:13px; cursor:pointer; font-family:'DM Sans'; font-weight:500;" [ngStyle]="{'color': viewMode==='timeline' ? '#38bdf8' : '#64748b', 'background': viewMode==='timeline' ? 'rgba(56,189,248,.1)' : 'transparent'}">
            <i class="fas fa-stream" style="margin-right:6px;"></i> Timeline
          </button>
        </div>
      </div>

      <div *ngIf="viewMode === 'table'" class="card p-0" style="background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          [dataSource]="filteredAlerts"
          [showBorders]="false"
          [rowAlternationEnabled]="true"
          [hoverStateEnabled]="true"
          [columnAutoWidth]="true"
          class="custom-grid"
        >
          <dxo-search-panel [visible]="true" width="300" placeholder="Tìm kiếm..."></dxo-search-panel>
          <dxo-paging [pageSize]="15"></dxo-paging>
          <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[15, 30, 50]" [showInfo]="true"></dxo-pager>
          <dxo-sorting mode="multiple"></dxo-sorting>
          
          <dxi-column dataField="timestamp" caption="Thời gian" dataType="datetime" sortOrder="desc" width="160" format="dd/MM/yyyy HH:mm"></dxi-column>
          
          <dxi-column dataField="stationName" caption="Trạm" width="180"></dxi-column>
          
          <dxi-column dataField="type" caption="Loại cảnh báo" width="160"></dxi-column>

          <dxi-column dataField="message" caption="Nội dung" minWidth="250"></dxi-column>

          <dxi-column dataField="level" caption="Mức độ" cellTemplate="levelTemplate" width="130" alignment="center"></dxi-column>
          <div *dxTemplate="let cell of 'levelTemplate'">
            <span class="badge" [ngClass]="'badge-' + cell.value">{{ cell.value | uppercase }}</span>
          </div>

          <dxi-column dataField="status" caption="Trạng thái" cellTemplate="statusTemplate" width="140" alignment="center"></dxi-column>
          <div *dxTemplate="let cell of 'statusTemplate'">
            <span class="st-badge" [ngClass]="'st-' + cell.value">
              {{ cell.value === 'resolved' ? 'Đã giải quyết' : (cell.value === 'closed' ? 'Đã đóng' : cell.value) }}
            </span>
          </div>

          <dxi-column dataField="resolution" caption="Hướng xử lý" minWidth="200" [visible]="false"></dxi-column>
          <dxi-column dataField="resolvedBy" caption="Người xử lý" width="150" [visible]="false"></dxi-column>

          <dxi-column type="buttons" caption="Chi tiết" width="80">
            <dxi-button hint="Xem chi tiết" icon="info"></dxi-button>
          </dxi-column>

        </dx-data-grid>
      </div>

      <div *ngIf="viewMode === 'timeline'" class="timeline-container" style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; padding: 24px;">
        <p-timeline [value]="filteredAlerts" align="alternate" styleClass="custom-timeline">
          <ng-template pTemplate="content" let-event>
            <div class="tl-card" [ngClass]="'tl-border-' + event.level" style="background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.3); padding: 16px; border-left-width: 4px; border-left-style: solid; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #94a3b8;"><i class="fas fa-clock"></i> {{ event.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="badge" [ngClass]="'badge-' + event.level" style="font-size: 9px; padding: 2px 8px;">{{ event.level | uppercase }}</span>
              </div>
              <h4 style="color: #e2e8f0; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">{{ event.message }}</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #64748b;">
                <span><i class="fas fa-map-marker-alt"></i> {{ event.stationName }}</span>
                <span><i class="fas fa-tag"></i> {{ event.type }}</span>
                <span class="st-badge" [ngClass]="'st-' + event.status" style="font-size: 10px; padding: 1px 6px;">{{ event.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng' }}</span>
              </div>
              <div *ngIf="event.resolution" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(51,65,85, 0.6); font-size: 12px; color: #cbd5e1;">
                <i class="fas fa-check-circle text-emerald-500"></i> <b>Xử lý:</b> {{ event.resolution }}
              </div>
            </div>
          </ng-template>
        </p-timeline>
        <div *ngIf="filteredAlerts.length === 0" style="text-align: center; padding: 40px; color: #64748b;">
          Không có sự kiện nào trong khoảng thời gian này.
        </div>
      </div>

    </div>
  `,
  styles: [`
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;}
    .badge-info { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-warning { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
    .badge-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-emergency { background: rgba(225, 29, 72, 0.2); color: #e11d48; border: 1px solid rgba(225, 29, 72, 0.5); }
    
    .st-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid; }
    .st-resolved { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }
    .st-closed { background: rgba(100, 116, 139, 0.1); color: #94a3b8; border-color: rgba(100, 116, 139, 0.3); }
    .st-new, .st-acknowledged, .st-in_progress { background: rgba(100, 116, 139, 0.1); color: #94a3b8; border-color: rgba(100, 116, 139, 0.3); }
    
    .tl-border-emergency { border-left-color: #ef4444 !important; }
    .tl-border-critical { border-left-color: #f97316 !important; }
    .tl-border-warning { border-left-color: #eab308 !important; }
    .tl-border-info { border-left-color: #3b82f6 !important; }

    ::ng-deep .custom-grid .dx-datagrid { color: #e2e8f0; }
    ::ng-deep .custom-grid .dx-datagrid-headers { background-color: rgba(15, 23, 42, 0.5); color: #cbd5e1; border-bottom: 1px solid rgba(51, 65, 85, 0.6); }
    ::ng-deep .custom-grid .dx-datagrid-headers .dx-datagrid-table .dx-row > td { border-bottom: none; font-weight: 600; font-size: 13px; text-transform: uppercase; }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row { border-bottom: 1px solid rgba(51, 65, 85, 0.4); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row.dx-row-alt { background-color: rgba(30, 41, 59, 0.3); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row:hover { background-color: rgba(51, 65, 85, 0.4); }

    ::ng-deep .custom-timeline .p-timeline-event-marker { border: 2px solid #8b5cf6; background: #1e293b; }
    ::ng-deep .custom-timeline .p-timeline-event-connector { background-color: #334155; }
    ::ng-deep .custom-timeline .p-timeline-event-opposite { display: none; }
  `]
})
export class AlertsHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('calendarHeatmap') calendarHeatmapEl!: ElementRef;
  allAlerts: Alert[] = [];
  filteredAlerts: Alert[] = [];

  viewMode: 'table' | 'timeline' = 'table';

  // KPI Stats
  resolvedCount = 0;
  avgResolutionTime = '2.5';
  topStation = '';

  // Filters
  fLevel: string | null = null;
  fType: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  levelOptions = [
    { value: 'emergency', text: 'Khẩn cấp' },
    { value: 'critical', text: 'Nghiêm trọng' },
    { value: 'warning', text: 'Cảnh báo' },
    { value: 'info', text: 'Thông tin' }
  ];

  typeOptions = [
    { value: 'AQI_THRESHOLD', text: 'Vượt ngưỡng AQI' },
    { value: 'CONNECTION_LOST', text: 'Mất kết nối' },
    { value: 'SENSOR_ERROR', text: 'Lỗi thiết bị' },
    { value: 'FORECAST_HIGH', text: 'Dự báo tăng đột biến' },
    { value: 'MAINTENANCE_DUE', text: 'Đến hạn bảo trì' }
  ];

  constructor(private alertService: AlertService, private exportSvc: ExportService) { }

  exportExcel() {
    this.exportSvc.exportExcel(this.filteredAlerts, [
      { header: 'Mã', key: 'id', width: 12 }, { header: 'Thời gian', key: 'timestamp', width: 20 },
      { header: 'Trạm', key: 'stationName', width: 25 }, { header: 'Loại', key: 'type', width: 18 },
      { header: 'Cấp độ', key: 'level', width: 12 }, { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Thông báo', key: 'message', width: 40 }
    ], 'canh-bao-lich-su');
  }

  exportPdf() {
    const rows = this.filteredAlerts.slice(0, 50).map(a =>
      `<tr><td>${a.id}</td><td>${new Date(a.timestamp).toLocaleString('vi-VN')}</td><td>${a.stationName}</td><td>${a.level}</td><td>${a.status}</td></tr>`
    ).join('');
    this.exportSvc.exportPdf('Lịch sử Cảnh báo', `<table><thead><tr><th>Mã</th><th>Thời gian</th><th>Trạm</th><th>Cấp độ</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table>`);
  }

  ngOnInit() {
    this.alertService.getAlerts().subscribe(data => {
      this.allAlerts = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.resolvedCount = this.allAlerts.filter(a => a.status === 'resolved' || a.status === 'closed').length;
      const counts: any = {};
      this.allAlerts.forEach(a => { counts[a.stationName] = (counts[a.stationName] || 0) + 1; });
      this.topStation = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
      this.applyFilters();
      setTimeout(() => this.createCalendarHeatmap(), 300);
    });
  }

  ngAfterViewInit() { }
  ngOnDestroy() { }

  createCalendarHeatmap() {
    if (!this.calendarHeatmapEl?.nativeElement) return;
    const el = this.calendarHeatmapEl.nativeElement;
    d3.select(el).selectAll('*').remove();
    const margin = { top: 20, right: 20, bottom: 20, left: 30 };
    const width = (el.clientWidth || 700) - margin.left - margin.right;
    const height = (el.clientHeight || 240) - margin.top - margin.bottom;
    const svg = d3.select(el).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => i + 'h');
    const x = d3.scaleBand().range([0, width]).domain(hours).padding(0.05);
    const y = d3.scaleBand().range([0, height]).domain(days).padding(0.05);
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove();
    svg.append('g').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
    const myColor = d3.scaleThreshold<number, string>().domain([2, 5, 8, 12]).range(['#1e293b', '#22c55e', '#eab308', '#f97316', '#ef4444']);
    const data: { day: string; hour: string; value: number }[] = [];
    days.forEach(day => {
      hours.forEach(hour => {
        let base = Math.floor(Math.random() * 3);
        const h = parseInt(hour, 10);
        if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) base += Math.floor(Math.random() * 8) + 3;
        else if (h >= 22 || h <= 5) base += Math.floor(Math.random() * 2);
        else base += Math.floor(Math.random() * 4);
        data.push({ day, hour, value: base });
      });
    });
    const tooltip = d3.select(el).append('div').style('opacity', 0).style('position', 'absolute').style('background', '#0f172a').style('border', '1px solid #334155').style('border-radius', '6px').style('padding', '6px 10px').style('color', '#e2e8f0').style('font-size', '11px').style('pointer-events', 'none').style('z-index', '10');
    svg.selectAll().data(data, (d: any) => d.day + ':' + d.hour).enter().append('rect')
      .attr('x', (d: any) => x(d.hour) || 0).attr('y', (d: any) => y(d.day) || 0).attr('rx', 3).attr('ry', 3)
      .attr('width', x.bandwidth()).attr('height', y.bandwidth())
      .style('fill', (d: any) => myColor(d.value)).style('opacity', .85).style('cursor', 'pointer')
      .on('mouseover', function (this: any) { d3.select(this).style('stroke', '#fff').style('stroke-width', 2); tooltip.style('opacity', 1) })
      .on('mousemove', function (event: any, d: any) { const cr = el.getBoundingClientRect(); tooltip.html(`${d.day} ${d.hour}: <b>${d.value}</b> cảnh báo`).style('left', (event.clientX - cr.left + 12) + 'px').style('top', (event.clientY - cr.top - 20) + 'px') })
      .on('mouseleave', function (this: any) { d3.select(this).style('stroke', 'none'); tooltip.style('opacity', 0) });
    svg.selectAll('.tick text').style('fill', '#94a3b8').style('font-family', 'DM Sans').style('font-size', '10px');
  }

  applyFilters() {
    let result = [...this.allAlerts];

    if (this.fLevel) {
      result = result.filter(a => a.level === this.fLevel);
    }
    if (this.fType) {
      result = result.filter(a => a.type === this.fType);
    }
    if (this.startDate) {
      const start = new Date(this.startDate).setHours(0, 0, 0, 0);
      result = result.filter(a => new Date(a.timestamp).getTime() >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate).setHours(23, 59, 59, 999);
      result = result.filter(a => new Date(a.timestamp).getTime() <= end);
    }

    this.filteredAlerts = result;
  }

  exportData() {
    console.log('Exporting data...');
    // Implementation for excel export goes here
  }
}
