import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule, DxButtonModule, DxSwitchModule, DxDataGridComponent } from 'devextreme-angular';
import { AlertService } from '../../../core/services/alert.service';
import { AlertConfig } from '../../../core/models';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-alerts-config',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule, DxButtonModule, DxSwitchModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;"><i class="fas fa-cog text-slate-400"></i> Cấu hình Ngưỡng Cảnh báo</h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Tùy chỉnh thông số cảnh báo tự động cho từng chỉ tiêu và khu vực.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <dx-button icon="add" text="Thêm cấu hình" type="default" (onClick)="addRow()"></dx-button>
        </div>
      </div>

      <div class="card p-0" style="background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(8px); border: 1px solid rgba(51, 65, 85, 0.4); border-radius: 12px; overflow:hidden;">
        <dx-data-grid
          #grid
          [dataSource]="configs"
          [showBorders]="false"
          [rowAlternationEnabled]="true"
          [hoverStateEnabled]="true"
          [columnAutoWidth]="true"
          class="custom-grid"
          (onRowUpdated)="onSaved()"
          (onRowInserted)="onSaved()"
          (onRowRemoved)="onSaved()"
        >
          <dxo-search-panel [visible]="true" width="250" placeholder="Tìm kiếm..."></dxo-search-panel>
          <dxo-editing 
            mode="row" 
            [allowUpdating]="true" 
            [allowDeleting]="true" 
            [useIcons]="true"
            [texts]="{ editRow: 'Sửa', deleteRow: 'Xóa', saveRowChanges: 'Lưu', cancelRowChanges: 'Hủy' }">
          </dxo-editing>

          <dxi-column dataField="parameter" caption="Chỉ tiêu" width="120" [validationRules]="[{type: 'required'}]"></dxi-column>
          
          <dxi-column dataField="areaType" caption="Khu vực áp dụng" width="150">
            <dxo-lookup [dataSource]="['urban', 'industrial', 'school', 'all']"></dxo-lookup>
          </dxi-column>

          <dxi-column caption="Ngưỡng Cảnh báo (Thresholds)" alignment="center">
            <dxi-column dataField="warningThreshold" caption="Warning" dataType="number" width="100" cssClass="col-warning" [validationRules]="[{type: 'required'}]"></dxi-column>
            <dxi-column dataField="criticalThreshold" caption="Critical" dataType="number" width="100" cssClass="col-critical" [validationRules]="[{type: 'required'}]"></dxi-column>
            <dxi-column dataField="emergencyThreshold" caption="Emergency" dataType="number" width="100" cssClass="col-emergency" [validationRules]="[{type: 'required'}]"></dxi-column>
          </dxi-column>

          <dxi-column dataField="sustainedMinutes" caption="Duy trì (phút)" dataType="number" width="120" alignment="center" [validationRules]="[{type: 'required'}]"></dxi-column>

          <dxi-column dataField="isActive" caption="Trạng thái" dataType="boolean" cellTemplate="statusTemplate" width="120" alignment="center"></dxi-column>
          <div *dxTemplate="let cell of 'statusTemplate'">
            <span class="st-badge" [ngClass]="cell.value ? 'st-on' : 'st-off'">
              <i class="fas" [ngClass]="cell.value ? 'fa-check-circle' : 'fa-times-circle'"></i> 
              {{ cell.value ? 'Đang bật' : 'Đã tắt' }}
            </span>
          </div>

        </dx-data-grid>
      </div>

      <div class="info-panel" style="margin-top:20px; padding:16px; background:rgba(56, 189, 248, 0.05); border:1px dashed rgba(56, 189, 248, 0.3); border-radius:12px; color:#94a3b8; font-size:13px; line-height:1.6;">
        <h4 style="color:#38bdf8; margin:0 0 8px 0; font-size:14px;"><i class="fas fa-info-circle"></i> Nguyên lý hoạt động</h4>
        <ul style="margin:0; padding-left:20px;">
          <li>Hệ thống liên tục kiểm tra giá trị AQI và các chỉ tiêu độc lập từ các trạm quan trắc.</li>
          <li>Cảnh báo chỉ được sinh ra nếu giá trị <b>vượt ngưỡng</b> liên tục trong khoảng thời gian bằng tham số <b>Duy trì (phút)</b> để tránh các nhiễu sóng tức thời.</li>
          <li>Khu vực áp dụng: <code>urban</code> (nội đô), <code>industrial</code> (khu công nghiệp), <code>school</code> (trường học), <code>all</code> (áp dụng toàn bộ).</li>
        </ul>
      </div>

    </div>
  `,
  styles: [`
    ::ng-deep .custom-grid .dx-datagrid { color: #e2e8f0; }
    ::ng-deep .custom-grid .dx-datagrid-headers { background-color: rgba(15, 23, 42, 0.5); color: #cbd5e1; border-bottom: 1px solid rgba(51, 65, 85, 0.6); }
    ::ng-deep .custom-grid .dx-datagrid-headers .dx-datagrid-table .dx-row > td { border-bottom: none; font-weight: 600; font-size: 13px; text-transform: uppercase; }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row { border-bottom: 1px solid rgba(51, 65, 85, 0.4); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row.dx-row-alt { background-color: rgba(30, 41, 59, 0.3); }
    ::ng-deep .custom-grid .dx-datagrid-rowsview .dx-row:hover { background-color: rgba(51, 65, 85, 0.4); }
    
    ::ng-deep .col-warning { color: #f97316 !important; font-weight: 600; font-family: 'Outfit'; }
    ::ng-deep .col-critical { color: #ef4444 !important; font-weight: 600; font-family: 'Outfit'; }
    ::ng-deep .col-emergency { color: #fca5a5 !important; font-weight: 600; font-family: 'Outfit'; }

    ::ng-deep .dx-command-edit .dx-button-content { color: #38bdf8; }

    .st-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid; display: inline-flex; align-items: center; gap: 4px;}
    .st-on { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }
    .st-off { background: rgba(100, 116, 139, 0.1); color: #94a3b8; border-color: rgba(100, 116, 139, 0.3); }
  `]
})
export class AlertsConfigComponent implements OnInit {
  @ViewChild('grid', { static: false }) grid!: DxDataGridComponent;
  configs: AlertConfig[] = [];

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertService.getAlertConfigs().subscribe(data => {
      // clone to avoid modifying mock data directly if edited
      this.configs = JSON.parse(JSON.stringify(data));
    });
  }

  addRow() {
    this.grid.instance.addRow();
  }

  onSaved() {
    notify({
      message: 'Đã lưu cấu hình ngưỡng cảnh báo thành công',
      type: 'success',
      displayTime: 3000,
      position: 'top right'
    });
  }
}
