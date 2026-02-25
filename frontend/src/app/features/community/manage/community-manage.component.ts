import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_COMMUNITY_REPORTS } from '../../../core/mock-data/others.mock';
import { DxDataGridModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-community-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-tasks text-emerald-400"></i> Quản lý Phản ánh Cộng đồng
          </h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Điều phối và theo dõi tiến độ xử lý {{reports.length}} phản ánh từ người dân</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px" (click)="exportPdf()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
      </div>

      <div class="kpi-row" style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px;">
        <div class="kpi-card" style="background: rgba(30,41,59,.6); border: 1px solid rgba(56, 189, 248, 0.3); border-left: 4px solid #38bdf8; border-radius: 12px; padding: 20px; text-align: center;">
          <b style="font-family:'Outfit'; font-size:32px; font-weight:700; color:#f1f5f9; display:block;">{{countByStatus('new')}}</b>
          <span style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Phản ánh Mới</span>
        </div>
        <div class="kpi-card" style="background: rgba(30,41,59,.6); border: 1px solid rgba(234, 179, 8, 0.3); border-left: 4px solid #eab308; border-radius: 12px; padding: 20px; text-align: center;">
          <b style="font-family:'Outfit'; font-size:32px; font-weight:700; color:#f1f5f9; display:block;">{{countByStatus('processing')}}</b>
          <span style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Đang xử lý</span>
        </div>
        <div class="kpi-card" style="background: rgba(30,41,59,.6); border: 1px solid rgba(34, 197, 94, 0.3); border-left: 4px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center;">
          <b style="font-family:'Outfit'; font-size:32px; font-weight:700; color:#f1f5f9; display:block;">{{countByStatus('resolved')}}</b>
          <span style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Đã giải quyết</span>
        </div>
        <div class="kpi-card" style="background: rgba(30,41,59,.6); border: 1px solid rgba(100, 116, 139, 0.3); border-left: 4px solid #64748b; border-radius: 12px; padding: 20px; text-align: center;">
          <b style="font-family:'Outfit'; font-size:32px; font-weight:700; color:#f1f5f9; display:block;">{{countByStatus('closed')}}</b>
          <span style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Đã đóng</span>
        </div>
      </div>

      <div class="card p-0" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          [dataSource]="reports"
          [showBorders]="false"
          [allowColumnResizing]="true"
          [columnAutoWidth]="true"
          [rowAlternationEnabled]="true"
          class="custom-grid community-grid"
          [hoverStateEnabled]="true"
          (onRowUpdated)="onRowUpdated($event)">
          
          <dxo-search-panel [visible]="true" [width]="350" placeholder="Tìm kiếm theo mã, địa chỉ..."></dxo-search-panel>
          <dxo-paging [pageSize]="15"></dxo-paging>
          <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[10, 15, 25, 50]" [showInfo]="true"></dxo-pager>
          <dxo-filter-row [visible]="true"></dxo-filter-row>
          <dxo-header-filter [visible]="true"></dxo-header-filter>
          <dxo-editing mode="form" [allowUpdating]="true" [useIcons]="true"></dxo-editing>

          <dxi-column dataField="code" caption="Mã phản ánh" cellTemplate="codeTemplate" [width]="130" [allowEditing]="false"></dxi-column>
          <dxi-column dataField="type" caption="Loại vấn đề" [allowEditing]="false" [width]="160"></dxi-column>
          <dxi-column dataField="description" caption="Mô tả chi tiết" [allowEditing]="false"></dxi-column>
          <dxi-column dataField="address" caption="Hành lang / Địa chỉ" [allowEditing]="false"></dxi-column>
          <dxi-column dataField="status" caption="Trạng thái" cellTemplate="statusTemplate" [width]="150">
            <dxo-lookup [dataSource]="statusList" valueExpr="id" displayExpr="name"></dxo-lookup>
          </dxi-column>
          <dxi-column dataField="createdAt" caption="Ngày gửi" dataType="datetime" format="dd/MM/yyyy HH:mm" [allowEditing]="false" [width]="140"></dxi-column>
          <dxi-column dataField="assignedTo" caption="Người xử lý" [width]="150"></dxi-column>
          
          <dxi-column type="buttons" [width]="60">
            <dxi-button name="edit" icon="edit"></dxi-button>
          </dxi-column>

          <div *dxTemplate="let cell of 'codeTemplate'">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #38bdf8; font-weight: 500;">PA-{{cell.value}}</span>
          </div>
          
          <div *dxTemplate="let cell of 'statusTemplate'">
            <span class="st-badge" [ngClass]="'st-' + cell.value">{{ statusLbl(cell.value) }}</span>
          </div>
        </dx-data-grid>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-grid .dx-datagrid { background-color: transparent !important; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
    ::ng-deep .custom-grid .dx-datagrid-headers { background-color: rgba(15, 23, 42, 0.4) !important; color: #94a3b8; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
    ::ng-deep .custom-grid .dx-datagrid-headers .dx-datagrid-table .dx-row > td { border-bottom: none !important; }
    ::ng-deep .custom-grid .dx-datagrid-content .dx-datagrid-table .dx-row > td { border-bottom: 1px solid rgba(51, 65, 85, 0.3) !important; color: #cbd5e1; }
    ::ng-deep .custom-grid .dx-datagrid-table .dx-row.dx-row-alt > td { background-color: rgba(15, 23, 42, 0.2) !important; }
    ::ng-deep .custom-grid .dx-datagrid-table .dx-row:hover > td { background-color: rgba(56, 189, 248, 0.05) !important; }
    ::ng-deep .custom-grid .dx-datagrid-borders > .dx-datagrid-filter-panel, ::ng-deep .dx-datagrid-borders > .dx-datagrid-headers { border-top: none !important; }
    ::ng-deep .custom-grid .dx-searchbox.dx-editor-outlined { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid #334155 !important; border-radius: 8px; }
    ::ng-deep .custom-grid .dx-texteditor-input { color: #e2e8f0 !important; }
    ::ng-deep .dx-datagrid-search-panel { margin: 15px 20px !important; }
    
    .st-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .st-new { background: rgba(56,189,248,.1); color: #38bdf8; border: 1px solid rgba(56,189,248,.2); }
    .st-reviewing { background: rgba(139,92,246,.1); color: #a78bfa; border: 1px solid rgba(139,92,246,.2); }
    .st-assigned { background: rgba(249,115,22,.1); color: #f97316; border: 1px solid rgba(249,115,22,.2); }
    .st-processing { background: rgba(234,179,8,.1); color: #eab308; border: 1px solid rgba(234,179,8,.2); }
    .st-resolved { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
    .st-closed { background: rgba(100,116,139,.1); color: #94a3b8; border: 1px solid rgba(100,116,139,.2); }
  `]
})
export class CommunityManageComponent {
  reports = [...MOCK_COMMUNITY_REPORTS];
  statusList = [{ id: 'new', name: 'Mới' }, { id: 'reviewing', name: 'Đang xem xét' }, { id: 'assigned', name: 'Đã giao người xử lý' }, { id: 'processing', name: 'Đang tiến hành xử lý' }, { id: 'resolved', name: 'Đã giải quyết' }, { id: 'closed', name: 'Đã đóng' }];
  constructor(private exportSvc: ExportService) { }
  countByStatus(s: string) { return this.reports.filter(r => r.status === s).length }
  statusLbl(s: string) { return this.statusList.find(x => x.id === s)?.name || s }
  onRowUpdated(e: any) { notify({ message: 'Đã cập nhật: PA-' + e.data.code, type: 'success', displayTime: 3000 }) }
  exportExcel() { this.exportSvc.exportExcel(this.reports, [{ header: 'Mã', key: 'code', width: 14 }, { header: 'Loại', key: 'type', width: 20 }, { header: 'Mô tả', key: 'description', width: 35 }, { header: 'Địa chỉ', key: 'address', width: 25 }, { header: 'Trạng thái', key: 'status', width: 14 }], 'phan-anh-cong-dong') }
  exportPdf() { const rows = this.reports.map(r => `<tr><td>PA-${r.code}</td><td>${r.type}</td><td>${r.address}</td><td>${r.status}</td></tr>`).join(''); this.exportSvc.exportPdf('Phản ánh Cộng đồng', `<table><thead><tr><th>Mã</th><th>Loại</th><th>Địa chỉ</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table>`) }
}
