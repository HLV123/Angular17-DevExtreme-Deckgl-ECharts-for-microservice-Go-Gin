import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-user-tag text-emerald-400"></i> Ma trận Phân quyền
          </h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Quyền truy cập hệ thống theo cấp độ Vai trò và Module</p>
        </div>
      </div>
      
      <div class="card p-0" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          [dataSource]="modules"
          [showBorders]="false"
          [allowColumnResizing]="true"
          [columnAutoWidth]="true"
          [rowAlternationEnabled]="true"
          class="custom-grid"
          [hoverStateEnabled]="true">
          
          <dxo-search-panel [visible]="true" [width]="300" placeholder="Tìm kiếm Module..."></dxo-search-panel>
          
          <dxi-column dataField="name" caption="Module / Tính năng" [width]="220" [fixed]="true" cssClass="mod-name" [allowEditing]="false"></dxi-column>
          
          <dxi-column *ngFor="let r of roles" [caption]="r" [dataField]="'perms.' + r" cellTemplate="permTemplate" alignment="center"></dxi-column>

          <div *dxTemplate="let cell of 'permTemplate'">
            <ng-container *ngIf="cell.value && cell.value.length > 0; else noPerm">
              <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">
                <span *ngFor="let p of cell.value" class="perm-tag" [ngClass]="'p-'+p">{{p}}</span>
              </div>
            </ng-container>
            <ng-template #noPerm><span class="no-access">—</span></ng-template>
          </div>
        </dx-data-grid>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-grid .dx-datagrid { background-color: transparent !important; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
    ::ng-deep .custom-grid .dx-datagrid-headers { background-color: rgba(15, 23, 42, 0.4) !important; color: #94a3b8; border-bottom: 1px solid rgba(51, 65, 85, 0.5); font-weight: 700; text-transform: uppercase; font-size: 11px; }
    ::ng-deep .custom-grid .dx-datagrid-headers .dx-datagrid-table .dx-row > td { border-bottom: none !important; }
    ::ng-deep .custom-grid .dx-datagrid-content .dx-datagrid-table .dx-row > td { border-bottom: 1px solid rgba(51, 65, 85, 0.3) !important; color: #cbd5e1; }
    ::ng-deep .custom-grid .dx-datagrid-table .dx-row.dx-row-alt > td { background-color: rgba(15, 23, 42, 0.2) !important; }
    ::ng-deep .custom-grid .dx-datagrid-table .dx-row:hover > td { background-color: rgba(56, 189, 248, 0.05) !important; }
    ::ng-deep .custom-grid .dx-datagrid-borders > .dx-datagrid-filter-panel, ::ng-deep .dx-datagrid-borders > .dx-datagrid-headers { border-top: none !important; }
    ::ng-deep .custom-grid .dx-searchbox.dx-editor-outlined { background: rgba(15, 23, 42, 0.6) !important; border: 1px solid #334155 !important; border-radius: 8px; }
    ::ng-deep .custom-grid .dx-texteditor-input { color: #e2e8f0 !important; }
    ::ng-deep .dx-datagrid-search-panel { margin: 15px 20px !important; }
    ::ng-deep .mod-name { font-weight: 600 !important; color: #f1f5f9 !important; font-size: 13px !important; }
    
    .perm-tag{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
    .p-view{background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.2)}
    .p-create{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.2)}
    .p-edit{background:rgba(234,179,8,.1);color:#eab308;border:1px solid rgba(234,179,8,.2)}
    .p-delete{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
    .p-export{background:rgba(139,92,246,.1);color:#a78bfa;border:1px solid rgba(139,92,246,.2)}
    .p-all{background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3)}
    .p-approve{background:rgba(236,72,153,.1);color:#ec4899;border:1px solid rgba(236,72,153,.2)}
    .no-access{color:#475569; font-weight:bold;}
  `]
})
export class AdminRolesComponent {
  roles = ['Admin', 'Expert', 'Operator', 'Leader', 'Citizen'];
  modules: any[] = [
    { name: 'Dashboard', perms: { Admin: ['all'], Expert: ['view'], Operator: ['view'], Leader: ['view'], Citizen: ['view'] } },
    { name: 'Trạm & Thiết bị', perms: { Admin: ['all'], Expert: ['view', 'edit'], Operator: ['view', 'edit'], Leader: ['view'], Citizen: [] } },
    { name: 'Giám sát AQI', perms: { Admin: ['all'], Expert: ['view', 'export'], Operator: ['view', 'export'], Leader: ['view', 'export'], Citizen: ['view'] } },
    { name: 'Bản đồ', perms: { Admin: ['all'], Expert: ['view'], Operator: ['view'], Leader: ['view'], Citizen: ['view'] } },
    { name: 'Cảnh báo', perms: { Admin: ['all'], Expert: ['view', 'create'], Operator: ['view', 'create', 'approve'], Leader: ['view'], Citizen: [] } },
    { name: 'Dự báo AI/ML', perms: { Admin: ['all'], Expert: ['view', 'create', 'edit'], Operator: ['view'], Leader: ['view'], Citizen: [] } },
    { name: 'Báo cáo', perms: { Admin: ['all'], Expert: ['view', 'export'], Operator: ['view', 'export'], Leader: ['view', 'export'], Citizen: [] } },
    { name: 'Nguồn ô nhiễm', perms: { Admin: ['all'], Expert: ['view', 'edit'], Operator: ['view'], Leader: ['view'], Citizen: [] } },
    { name: 'Phản ánh CĐ', perms: { Admin: ['all'], Expert: [], Operator: ['view', 'edit', 'approve'], Leader: ['view'], Citizen: ['create', 'view'] } },
    { name: 'Người dùng', perms: { Admin: ['all'], Expert: [], Operator: [], Leader: [], Citizen: [] } },
    { name: 'API & Tích hợp', perms: { Admin: ['all'], Expert: [], Operator: [], Leader: [], Citizen: [] } },
    { name: 'Cấu hình HT', perms: { Admin: ['all'], Expert: [], Operator: [], Leader: [], Citizen: [] } },
  ];
}
