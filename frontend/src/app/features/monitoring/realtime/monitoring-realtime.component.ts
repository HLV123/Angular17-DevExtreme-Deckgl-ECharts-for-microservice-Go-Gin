import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DxDataGridModule, DxDateBoxModule, DxButtonModule } from 'devextreme-angular';
import { AqiService } from '../../../core/services/aqi.service';
import { AqiReading } from '../../../core/models';
import { getAqiColor, getAqiLabel, getAqiLevelClass } from '../../../core/mock-data';
import { ExportService } from '../../../core/services/export.service';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-monitoring-realtime', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DxDataGridModule, DxDateBoxModule, DxButtonModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-signal"></i> Giám sát AQI Realtime</h1>
          <p>{{readings.length}} trạm đang online · Cập nhật mỗi 30s</p>
        </div>
        <div class="header-right">
          <span class="live-badge"><span class="dot"></span> LIVE</span>
          <div class="date-range">
            <dx-date-box [(value)]="fromDate" type="datetime" placeholder="Từ" width="170" [showClearButton]="true" (onValueChanged)="onDateChanged()"></dx-date-box>
            <span style="color:#64748b">→</span>
            <dx-date-box [(value)]="toDate" type="datetime" placeholder="Đến" width="170" [showClearButton]="true" (onValueChanged)="onDateChanged()"></dx-date-box>
          </div>
          <button class="btn-sec" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button class="btn-sec" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
      </div>

      <div class="grid-card">
        <dx-data-grid
          #realtimeGrid
          [dataSource]="filteredReadings"
          [showBorders]="false"
          [rowAlternationEnabled]="true"
          [hoverStateEnabled]="true"
          [columnAutoWidth]="true"
          class="custom-grid"
          [wordWrapEnabled]="false"
          (onExporting)="onGridExport($event)"
          (onRowClick)="onRowClick($event)">
          <dxo-search-panel [visible]="true" width="280" placeholder="Tìm trạm..."></dxo-search-panel>
          <dxo-paging [pageSize]="20"></dxo-paging>
          <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[10,20,50]" [showInfo]="true"></dxo-pager>
          <dxo-sorting mode="multiple"></dxo-sorting>
          <dxo-filter-row [visible]="true"></dxo-filter-row>
          <dxo-export [enabled]="true"></dxo-export>

          <dxi-column dataField="stationName" caption="Trạm" cellTemplate="stationTpl" width="200"></dxi-column>
          <dxi-column dataField="aqi" caption="AQI" cellTemplate="aqiTpl" width="90" alignment="center" sortOrder="desc"></dxi-column>
          <dxi-column dataField="aqiLevel" caption="Mức" cellTemplate="levelTpl" width="120" alignment="center"></dxi-column>
          <dxi-column dataField="pm25" caption="PM2.5" width="80" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="pm10" caption="PM10" width="80" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="co" caption="CO" width="70" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="no2" caption="NO₂" width="70" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="so2" caption="SO₂" width="70" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="o3" caption="O₃" width="70" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="temperature" caption="°C" width="60" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="humidity" caption="% Ẩm" width="70" alignment="center" dataType="number"></dxi-column>
          <dxi-column dataField="windSpeed" caption="Gió m/s" width="80" alignment="center" dataType="number"></dxi-column>

          <div *dxTemplate="let cell of 'stationTpl'">
            <a [routerLink]="['/monitoring/station', cell.data.stationId]" class="station-link">{{cell.value}}</a>
          </div>
          <div *dxTemplate="let cell of 'aqiTpl'">
            <span class="aqi-val" [style.color]="getAqiColor(cell.value)">{{cell.value}}</span>
          </div>
          <div *dxTemplate="let cell of 'levelTpl'">
            <span class="aqi-badge" [ngClass]="getAqiLevelClass(cell.data.aqi)">{{getAqiLabel(cell.data.aqi)}}</span>
          </div>
        </dx-data-grid>
      </div>
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px}
    .page-header h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.page-header h1 i{color:#38bdf8}
    .page-header p{color:#64748b;font-size:13px;margin-top:4px}
    .header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .live-badge{display:flex;align-items:center;gap:6px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;color:#22c55e}
    .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    .date-range{display:flex;align-items:center;gap:6px}
    .btn-sec{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:8px 14px;border-radius:8px;font-weight:700;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:6px}
    .grid-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;overflow:hidden;padding:10px}
    ::ng-deep .custom-grid .dx-datagrid{color:#cbd5e1;font-family:'DM Sans';background:transparent}::ng-deep .custom-grid .dx-datagrid-headers{background:rgba(15,23,42,.5);color:#64748b;border-bottom:1px solid rgba(51,65,85,.6)}
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row{border-bottom:1px solid rgba(51,65,85,.3)}::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row.dx-row-alt{background-color:rgba(30,41,59,.3)}
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row:hover{background-color:rgba(51,65,85,.4)}::ng-deep .custom-grid .dx-texteditor-input{color:#e2e8f0!important}
    ::ng-deep .custom-grid .dx-searchbox.dx-editor-outlined{background:rgba(15,23,42,.6)!important;border:1px solid #334155!important;border-radius:8px}
    .station-link{color:#38bdf8;text-decoration:none;font-weight:600}.station-link:hover{text-decoration:underline}
    .aqi-val{font-family:'Outfit';font-weight:800;font-size:18px}
    .aqi-badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
    .aqi-badge.good{background:rgba(34,197,94,.15);color:#22c55e}.aqi-badge.moderate{background:rgba(234,179,8,.15);color:#eab308}.aqi-badge.unhealthy-sg{background:rgba(249,115,22,.15);color:#f97316}.aqi-badge.unhealthy{background:rgba(239,68,68,.15);color:#ef4444}.aqi-badge.very-unhealthy{background:rgba(139,92,246,.15);color:#8b5cf6}.aqi-badge.hazardous{background:rgba(153,27,27,.2);color:#fca5a5}
  `]
})
export class MonitoringRealtimeComponent implements OnInit, OnDestroy {
  readings: AqiReading[] = [];
  filteredReadings: AqiReading[] = [];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  getAqiColor = getAqiColor;
  getAqiLabel = getAqiLabel;
  getAqiLevelClass = getAqiLevelClass;
  private sub: Subscription | null = null;

  constructor(private aqiService: AqiService, private exportSvc: ExportService) { }

  ngOnInit() {
    this.loadData();
    this.sub = interval(30000).subscribe(() => this.loadData());
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadData() {
    this.aqiService.getCurrentAqi().subscribe(r => {
      this.readings = r.sort((a, b) => b.aqi - a.aqi);
      this.applyDateFilter();
    });
  }

  onDateChanged() { this.applyDateFilter(); }

  applyDateFilter() {
    let r = [...this.readings];
    if (this.fromDate) r = r.filter(x => new Date(x.timestamp) >= this.fromDate!);
    if (this.toDate) r = r.filter(x => new Date(x.timestamp) <= this.toDate!);
    this.filteredReadings = r;
  }

  onRowClick(e: any) { }

  onGridExport(e: any) {
    const workbook = new Workbook();
    const ws = workbook.addWorksheet('AQI Realtime');
    exportDataGrid({ component: e.component, worksheet: ws, autoFilterEnabled: true }).then(() => {
      workbook.xlsx.writeBuffer().then(buf => saveAs(new Blob([buf], { type: 'application/octet-stream' }), `aqi_realtime_${Date.now()}.xlsx`));
    });
    e.cancel = true;
  }

  exportExcel() {
    this.exportSvc.exportExcel(this.filteredReadings, [
      { header: 'Trạm', key: 'stationName', width: 25 }, { header: 'AQI', key: 'aqi', width: 10 }, { header: 'PM2.5', key: 'pm25', width: 10 },
      { header: 'PM10', key: 'pm10', width: 10 }, { header: 'CO', key: 'co', width: 10 }, { header: 'NO2', key: 'no2', width: 10 },
      { header: 'SO2', key: 'so2', width: 10 }, { header: 'O3', key: 'o3', width: 10 }, { header: '°C', key: 'temperature', width: 8 }, { header: '%Ẩm', key: 'humidity', width: 8 }
    ], 'aqi-realtime');
  }

  exportPdf() {
    const rows = this.filteredReadings.map(r => `<tr><td>${r.stationName}</td><td>${r.aqi}</td><td>${r.pm25}</td><td>${r.pm10}</td><td>${r.co}</td><td>${r.no2}</td><td>${r.temperature}°C</td></tr>`).join('');
    this.exportSvc.exportPdf('AQI Realtime', `<table><thead><tr><th>Trạm</th><th>AQI</th><th>PM2.5</th><th>PM10</th><th>CO</th><th>NO₂</th><th>°C</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
}
