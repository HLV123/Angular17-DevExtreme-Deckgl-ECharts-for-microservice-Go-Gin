import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { AlertService } from '../../../core/services/alert.service';
import { Alert } from '../../../core/models';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-alerts-active',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule, DxButtonModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;"><i class="fas fa-bell text-rose-500"></i> Cảnh báo đang hoạt động</h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">{{ activeAlerts.length }} cảnh báo cần xử lý trên toàn mạng lưới.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
          <dx-button icon="refresh" stylingMode="outlined" text="Làm mới" (onClick)="loadAlerts()"></dx-button>
        </div>
      </div>

      <div class="kpi-row" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px;">
        <div class="kc" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; display:flex; align-items:center; gap:16px;">
          <div class="ki" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px; background:rgba(225,29,72,.15); color:#e11d48;"><i class="fas fa-radiation"></i></div>
          <div><b style="font-size:28px; font-weight:700; color:#f1f5f9; display:block; line-height:1; font-family:'Outfit';">{{emergencyCount}}</b><span style="font-size:12px; color:#94a3b8;">Khẩn cấp</span></div>
        </div>
        <div class="kc" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; display:flex; align-items:center; gap:16px;">
          <div class="ki" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px; background:rgba(239,68,68,.15); color:#ef4444;"><i class="fas fa-exclamation-circle"></i></div>
          <div><b style="font-size:28px; font-weight:700; color:#f1f5f9; display:block; line-height:1; font-family:'Outfit';">{{criticalCount}}</b><span style="font-size:12px; color:#94a3b8;">Nghiêm trọng</span></div>
        </div>
        <div class="kc" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; display:flex; align-items:center; gap:16px;">
          <div class="ki" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px; background:rgba(249,115,22,.15); color:#f97316;"><i class="fas fa-exclamation-triangle"></i></div>
          <div><b style="font-size:28px; font-weight:700; color:#f1f5f9; display:block; line-height:1; font-family:'Outfit';">{{warningCount}}</b><span style="font-size:12px; color:#94a3b8;">Cảnh báo</span></div>
        </div>
        <div class="kc" style="background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.4); border-radius:14px; padding:16px; display:flex; align-items:center; gap:16px;">
          <div class="ki" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px; background:rgba(56,189,248,.15); color:#38bdf8;"><i class="fas fa-info-circle"></i></div>
          <div><b style="font-size:28px; font-weight:700; color:#f1f5f9; display:block; line-height:1; font-family:'Outfit';">{{infoCount}}</b><span style="font-size:12px; color:#94a3b8;">Thông tin</span></div>
        </div>
      </div>

      <div class="card p-0" style="background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          [dataSource]="activeAlerts"
          [showBorders]="false"
          [rowAlternationEnabled]="true"
          [hoverStateEnabled]="true"
          [columnAutoWidth]="true"
          class="custom-grid"
        >
          <dxo-search-panel [visible]="true" width="300" placeholder="Tìm kiếm cảnh báo..."></dxo-search-panel>
          <dxo-paging [pageSize]="15"></dxo-paging>
          <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[15, 30, 50]" [showInfo]="true"></dxo-pager>
          <dxo-sorting mode="multiple"></dxo-sorting>
          <dxo-filter-row [visible]="true"></dxo-filter-row>
          <dxo-header-filter [visible]="true"></dxo-header-filter>

          <dxi-column dataField="id" caption="Mã CB" width="100" [allowHeaderFiltering]="false" cellTemplate="idTemplate"></dxi-column>
          <div *dxTemplate="let cell of 'idTemplate'">
            <span style="font-family: monospace; color: #94a3b8;">{{cell.value}}</span>
          </div>
          
          <dxi-column dataField="timestamp" caption="Thời gian" dataType="datetime" sortOrder="desc" width="160" cellTemplate="timeTemplate"></dxi-column>
          <div *dxTemplate="let cell of 'timeTemplate'">
            <div style="font-weight:500; color:#e2e8f0;">{{ cell.value | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>

          <dxi-column dataField="stationName" caption="Trạm" width="180"></dxi-column>
          
          <dxi-column dataField="level" caption="Mức độ" cellTemplate="levelTemplate" width="140" alignment="center"></dxi-column>
          <div *dxTemplate="let cell of 'levelTemplate'">
            <span class="badge" [ngClass]="'badge-' + cell.value">{{ cell.value | uppercase }}</span>
          </div>

          <dxi-column dataField="type" caption="Loại cảnh báo" width="160"></dxi-column>

          <dxi-column dataField="parameter" caption="Chỉ tiêu" width="100" alignment="center"></dxi-column>
          
          <dxi-column dataField="value" caption="Giá trị" cellTemplate="valueTemplate" width="120" alignment="right"></dxi-column>
          <div *dxTemplate="let cell of 'valueTemplate'" style="font-weight:600; color:#ef4444;">
            {{ cell.data.value }} <span style="color:#64748b; font-size:11px; font-weight:400;">/ {{ cell.data.threshold }}</span>
          </div>

          <dxi-column dataField="message" caption="Nội dung" minWidth="250"></dxi-column>

          <dxi-column dataField="status" caption="Trạng thái" cellTemplate="statusTemplate" width="140" alignment="center"></dxi-column>
          <div *dxTemplate="let cell of 'statusTemplate'">
            <span class="st-badge" [ngClass]="'st-' + cell.value">
              {{ cell.value === 'new' ? 'Mới' : (cell.value === 'acknowledged' ? 'Đã xem' : 'Đang xử lý') }}
            </span>
          </div>

          <dxi-column type="buttons" caption="Thao tác" width="120">
            <dxi-button hint="Xem chi tiết" icon="eye"></dxi-button>
            <dxi-button hint="Nhận xử lý" icon="check" [visible]="isNew"></dxi-button>
          </dxi-column>
        </dx-data-grid>
      </div>
    </div>
  `,
  styles: [`
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;}
    .badge-info { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-warning { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
    .badge-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-emergency { background: rgba(225, 29, 72, 0.2); color: #e11d48; border: 1px solid rgba(225, 29, 72, 0.5); box-shadow: 0 0 10px rgba(225, 29, 72, 0.3); animation: pulseAlert 2s infinite; }
    
    @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0); } 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }

    .st-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid; }
    .st-new { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
    .st-acknowledged { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border-color: rgba(139, 92, 246, 0.3); }
    .st-in_progress { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3); }
    
    ::ng-deep .custom-grid .dx-datagrid { color: #e2e8f0; }
    ::ng-deep .custom-grid .dx-datagrid-headers { background-color: rgba(15, 23, 42, 0.5); color: #cbd5e1; border-bottom: 1px solid rgba(51, 65, 85, 0.6); }
    ::ng-deep .custom-grid .dx-datagrid-headers .dx-datagrid-table .dx-row > td { border-bottom: none; font-weight: 600; font-size: 13px; text-transform: uppercase; }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row { border-bottom: 1px solid rgba(51, 65, 85, 0.4); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row.dx-row-alt { background-color: rgba(30, 41, 59, 0.3); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row:hover { background-color: rgba(51, 65, 85, 0.4); }
  `]
})
export class AlertsActiveComponent implements OnInit {
  allAlerts: Alert[] = [];
  activeAlerts: Alert[] = [];
  emergencyCount = 0;
  criticalCount = 0;
  warningCount = 0;
  infoCount = 0;

  constructor(private alertService: AlertService, private exportSvc: ExportService) { }

  ngOnInit() { this.loadAlerts(); }

  loadAlerts() {
    this.alertService.getAlerts().subscribe(data => {
      this.allAlerts = data;
      this.activeAlerts = this.allAlerts.filter(x => ['new', 'acknowledged', 'in_progress'].includes(x.status));
      this.emergencyCount = this.activeAlerts.filter(x => x.level === 'emergency').length;
      this.criticalCount = this.activeAlerts.filter(x => x.level === 'critical').length;
      this.warningCount = this.activeAlerts.filter(x => x.level === 'warning').length;
      this.infoCount = this.activeAlerts.filter(x => x.level === 'info').length;
    });
  }

  isNew(e: any) { return e.row.data.status === 'new'; }

  exportExcel() {
    this.exportSvc.exportExcel(this.activeAlerts, [
      { header: 'Mã', key: 'id', width: 12 }, { header: 'Thời gian', key: 'timestamp', width: 20 }, { header: 'Trạm', key: 'stationName', width: 25 },
      { header: 'Loại', key: 'type', width: 18 }, { header: 'Cấp độ', key: 'level', width: 12 }, { header: 'Thông báo', key: 'message', width: 40 }
    ], 'canh-bao-dang-hoat-dong');
  }

  exportPdf() {
    const rows = this.activeAlerts.map(a => `<tr><td>${a.id}</td><td>${new Date(a.timestamp).toLocaleString('vi-VN')}</td><td>${a.stationName}</td><td>${a.level}</td><td>${a.message}</td></tr>`).join('');
    this.exportSvc.exportPdf('Cảnh báo đang hoạt động', `<table><thead><tr><th>Mã</th><th>Thời gian</th><th>Trạm</th><th>Cấp độ</th><th>Nội dung</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
}

