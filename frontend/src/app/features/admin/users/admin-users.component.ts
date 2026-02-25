import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_USERS } from '../../../core/mock-data/users.mock';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-users-cog text-sky-400"></i> Quản lý Người dùng
          </h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">{{users.length}} tài khoản đang hoạt động trong hệ thống</p>
        </div>
      </div>

      <div class="card p-0" style="background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          [dataSource]="users"
          [showBorders]="false"
          [allowColumnResizing]="true"
          [columnAutoWidth]="true"
          [rowAlternationEnabled]="true"
          class="custom-grid"
          [hoverStateEnabled]="true">
          
          <dxo-search-panel [visible]="true" [width]="350" placeholder="Tìm kiếm tài khoản, email..."></dxo-search-panel>
          <dxo-paging [pageSize]="15"></dxo-paging>
          <dxo-pager [showPageSizeSelector]="true" [allowedPageSizes]="[10, 15, 25, 50]" [showInfo]="true"></dxo-pager>
          <dxo-filter-row [visible]="true"></dxo-filter-row>
          <dxo-header-filter [visible]="true"></dxo-header-filter>
          <dxo-editing mode="popup" [allowUpdating]="true" [allowAdding]="true" [allowDeleting]="true" [useIcons]="true">
            <dxo-popup title="Thông tin Người dùng" [showTitle]="true" [width]="700" [height]="525"></dxo-popup>
            <dxo-form>
              <dxi-item itemType="group" [colCount]="2" [colSpan]="2">
                <dxi-item dataField="fullName"></dxi-item>
                <dxi-item dataField="email"></dxi-item>
                <dxi-item dataField="role"></dxi-item>
                <dxi-item dataField="department"></dxi-item>
                <dxi-item dataField="isActive"></dxi-item>
              </dxi-item>
            </dxo-form>
          </dxo-editing>

          <dxi-column dataField="avatar" caption="" cellTemplate="avatarTemplate" [width]="60" [allowFiltering]="false" [allowSorting]="false" [allowEditing]="false"></dxi-column>
          <dxi-column dataField="fullName" caption="Họ và Tên"></dxi-column>
          <dxi-column dataField="email" caption="Thư điện tử (Email)"></dxi-column>
          <dxi-column dataField="role" caption="Vai trò" cellTemplate="roleTemplate">
            <dxo-lookup [dataSource]="rolesList" valueExpr="id" displayExpr="name"></dxo-lookup>
          </dxi-column>
          <dxi-column dataField="department" caption="Đơn vị / Phòng ban"></dxi-column>
          <dxi-column dataField="isActive" caption="Trạng thái" cellTemplate="statusTemplate" dataType="boolean"></dxi-column>
          <dxi-column dataField="lastLogin" caption="Đăng nhập cuối" dataType="datetime" format="dd/MM/yyyy HH:mm" [allowEditing]="false"></dxi-column>

          <div *dxTemplate="let cell of 'avatarTemplate'">
            <div class="avatar">{{ cell.data.fullName.charAt(0) }}</div>
          </div>
          
          <div *dxTemplate="let cell of 'roleTemplate'">
            <span class="role-badge" [ngClass]="'role-' + cell.value">{{ roleLbl(cell.value) }}</span>
          </div>

          <div *dxTemplate="let cell of 'statusTemplate'">
            <span class="st" [ngClass]="cell.value ? 'active' : 'inactive'">
              <i class="fas fa-circle"></i> {{ cell.value ? 'Hoạt động' : 'Tạm khóa' }}
            </span>
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
    
    .avatar{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0ea5e9,#22c55e);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff}
    .role-badge{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
    .role-admin{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
    .role-expert{background:rgba(139,92,246,.1);color:#a78bfa;border:1px solid rgba(139,92,246,.2)}
    .role-operator{background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.2)}
    .role-leader{background:rgba(234,179,8,.1);color:#eab308;border:1px solid rgba(234,179,8,.2)}
    .role-citizen{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.2)}
    .role-partner{background:rgba(236,72,153,.1);color:#ec4899;border:1px solid rgba(236,72,153,.2)}
    .st{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600}
    .st i{font-size:8px}
    .st.active{color:#22c55e}
    .st.inactive{color:#ef4444}
  `]
})
export class AdminUsersComponent {
  users = MOCK_USERS;

  rolesList = [
    { id: 'admin', name: 'Quản trị HT (Admin)' },
    { id: 'expert', name: 'Chuyên gia (Expert)' },
    { id: 'operator', name: 'Vận hành (Operator)' },
    { id: 'leader', name: 'Lãnh đạo (Leader)' },
    { id: 'citizen', name: 'Người dân' },
    { id: 'partner', name: 'Đối tác' }
  ];

  roleLbl(r: string) {
    return this.rolesList.find(x => x.id === r)?.name || r;
  }
}
