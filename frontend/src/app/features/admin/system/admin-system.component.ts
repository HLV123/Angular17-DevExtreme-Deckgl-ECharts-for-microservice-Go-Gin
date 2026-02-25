import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxSwitchModule, DxTextBoxModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-admin-system',
  standalone: true,
  imports: [CommonModule, FormsModule, DxSwitchModule, DxTextBoxModule, DxSelectBoxModule, DxButtonModule],
  template: `
    <div class="page animate-fade-in" style="min-height: calc(100vh - 70px);">
      <div class="page-header" style="display:flex; justify-content:space-between; margin-bottom: 24px;">
        <div>
          <h1 style="font-family:'Outfit'; font-size:22px; color:#f1f5f9; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-sliders-h text-emerald-400"></i> Cấu hình Hệ thống
          </h1>
          <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Quản lý các thông số cốt lõi và tích hợp của hệ thống Urban Air</p>
        </div>
        <div class="hdr-acts">
          <dx-button text="Lưu cấu hình" icon="save" type="default" (onClick)="saveSettings()" [stylingMode]="'contained'"></dx-button>
        </div>
      </div>
    
      <div class="settings-grid">
        <!-- SMTP Config -->
        <div class="settings-card">
          <div class="card-hdr">
            <h3><i class="fas fa-envelope text-sky-400"></i> Cấu hình Email (SMTP)</h3>
            <dx-switch [(value)]="settings.smtp.enabled"></dx-switch>
          </div>
          <div class="cbody" [class.disabled]="!settings.smtp.enabled">
            <div class="fg">
              <label>Máy chủ SMTP</label>
              <dx-text-box [(value)]="settings.smtp.host" placeholder="smtp.gmail.com" [disabled]="!settings.smtp.enabled"></dx-text-box>
            </div>
            <div class="frow">
              <div class="fg">
                <label>Cổng (Port)</label>
                <dx-text-box [(value)]="settings.smtp.port" placeholder="587" [disabled]="!settings.smtp.enabled"></dx-text-box>
              </div>
              <div class="fg">
                <label>Mã hóa</label>
                <dx-select-box [(value)]="settings.smtp.encryption" [items]="['tls', 'ssl', 'none']" [disabled]="!settings.smtp.enabled"></dx-select-box>
              </div>
            </div>
            <div class="fg">
              <label>Tài khoản</label>
              <dx-text-box [(value)]="settings.smtp.username" placeholder="alerts@urban-air.vn" [disabled]="!settings.smtp.enabled"></dx-text-box>
            </div>
            <div class="fg">
              <label>Mật khẩu / App Password</label>
              <dx-text-box [(value)]="settings.smtp.password" mode="password" placeholder="••••••••••••" [disabled]="!settings.smtp.enabled"></dx-text-box>
            </div>
            <div class="mt-10">
              <dx-button text="Gửi email test" icon="paper-plane" [disabled]="!settings.smtp.enabled" [stylingMode]="'outlined'" type="normal"></dx-button>
            </div>
          </div>
        </div>

        <!-- MQTT Broker -->
        <div class="settings-card">
          <div class="card-hdr">
            <h3><i class="fas fa-network-wired text-orange-400"></i> Kết nối MQTT Broker</h3>
            <div class="badge success"><i class="fas fa-check-circle"></i> Connected</div>
          </div>
          <div class="cbody">
            <div class="fg">
              <label>Broker URL</label>
              <dx-text-box [(value)]="settings.mqtt.url" placeholder="wss://broker.emqx.io:8084/mqtt"></dx-text-box>
            </div>
            <div class="frow">
              <div class="fg">
                <label>Username</label>
                <dx-text-box [(value)]="settings.mqtt.username" placeholder="sensor_client"></dx-text-box>
              </div>
              <div class="fg">
                <label>Password</label>
                <dx-text-box [(value)]="settings.mqtt.password" mode="password" placeholder="••••••••"></dx-text-box>
              </div>
            </div>
            <div class="fg">
              <label>Client ID Prefix</label>
              <dx-text-box [(value)]="settings.mqtt.clientId" placeholder="urban-air-web-"></dx-text-box>
            </div>
            <div class="info-box mt-10">
              <i class="fas fa-info-circle text-sky-400"></i> 
              <span>Web Client đang kết nối thành công tới broker. Đã nhận <b>1,245</b> messages trong giờ qua.</span>
            </div>
          </div>
        </div>

        <!-- Backup Settings -->
        <div class="settings-card">
          <div class="card-hdr">
            <h3><i class="fas fa-database text-purple-400"></i> Sao lưu Dữ liệu</h3>
            <dx-switch [(value)]="settings.backup.auto"></dx-switch>
          </div>
          <div class="cbody" [class.disabled]="!settings.backup.auto">
            <div class="fg">
              <label>Tần suất sao lưu</label>
              <dx-select-box [(value)]="settings.backup.frequency" valueExpr="id" displayExpr="name" [items]="freqs" [disabled]="!settings.backup.auto"></dx-select-box>
            </div>
            <div class="fg">
              <label>Nơi lưu trữ</label>
              <dx-select-box [(value)]="settings.backup.storage" valueExpr="id" displayExpr="name" [items]="storages" [disabled]="!settings.backup.auto"></dx-select-box>
            </div>
            <div class="fg">
              <label>Thời gian lưu trữ (ngày)</label>
              <dx-text-box [(value)]="settings.backup.retention" [disabled]="!settings.backup.auto"></dx-text-box>
            </div>
            <div class="mt-10">
              <dx-button text="Sao lưu thủ công ngay" icon="save" (onClick)="backupNow()" [stylingMode]="'outlined'" type="normal"></dx-button>
            </div>
          </div>
        </div>
        
        <!-- System Maintenance -->
        <div class="settings-card">
          <div class="card-hdr">
            <h3><i class="fas fa-tools text-slate-400"></i> Bảo trì & Quản trị</h3>
          </div>
          <div class="cbody">
            <div class="action-item">
              <div class="act-info"><h4>Xóa cache hệ thống</h4><p>Giải phóng bộ nhớ Redis và cache giao diện</p></div>
              <dx-button text="Clear Cache" type="normal" [stylingMode]="'outlined'" (onClick)="clearCache()"></dx-button>
            </div>
            <div class="action-item">
              <div class="act-info"><h4>Chế độ bảo trì hệ thống</h4><p>Chỉ Admin mới có thể đăng nhập. Tạm dừng API public.</p></div>
              <dx-switch [(value)]="settings.maintenanceMode"></dx-switch>
            </div>
            <div class="action-item text-danger border-none">
              <div class="act-info"><h4>Khởi động lại Services</h4><p>Backend API và Worker sẽ bị gián đoạn 1-2 phút</p></div>
              <dx-button text="Restart" type="danger" [stylingMode]="'outlined'" (onClick)="restart()"></dx-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(500px,1fr));gap:24px;}
    .settings-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:12px;overflow:hidden;backdrop-filter:blur(8px);}
    .card-hdr{background:rgba(15,23,42,.6);padding:16px 20px;border-bottom:1px solid rgba(51,65,85,.4);display:flex;justify-content:space-between;align-items:center}.card-hdr h3{font-family:'Outfit';font-size:16px;color:#e2e8f0;display:flex;align-items:center;gap:10px;}
    .cbody{padding:24px;transition:opacity .3s}.cbody.disabled{opacity:.5;pointer-events:none}
    
    .fg{margin-bottom:18px}.fg label{display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px}
    .frow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .mt-10{margin-top:20px}
    
    .info-box{background:rgba(56,189,248,.05);border-left:3px solid #38bdf8;padding:14px;border-radius:8px;font-size:13px;color:#cbd5e1;line-height:1.5;display:flex;gap:12px;align-items:flex-start}
    .badge{padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:0.5px;}.badge.success{background:rgba(34,197,94,.1);color:#22c55e}
    
    .action-item{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(51,65,85,.3)}.action-item.border-none{border-bottom:none;padding-bottom:0}.act-info h4{font-size:14px;color:#e2e8f0;margin-bottom:4px;font-weight:600}.act-info p{font-size:12px;color:#64748b}.text-danger h4{color:#ef4444}
    
    ::ng-deep .dx-texteditor-input { color: #e2e8f0 !important; font-family: 'DM Sans', sans-serif !important; }
    ::ng-deep .dx-dropdowneditor-input-wrapper .dx-texteditor-input { color: #e2e8f0 !important; }
    ::ng-deep .dx-texteditor.dx-editor-outlined { background: rgba(15,23,42,.6) !important; border: 1px solid #334155 !important; border-radius: 8px !important; }
    ::ng-deep .dx-switch-on { background-color: #22c55e !important; }
    ::ng-deep .dx-button-mode-contained.dx-button-default { background: linear-gradient(135deg, #0ea5e9, #22c55e) !important; color: #fff !important; border: none !important; border-radius: 8px !important; }
    ::ng-deep .dx-button-mode-outlined.dx-button-normal { border-color: #334155 !important; color: #cbd5e1 !important; border-radius: 8px !important; }
    ::ng-deep .dx-button-mode-outlined.dx-button-danger { border-color: rgba(239,68,68,0.3) !important; color: #ef4444 !important; background: rgba(239,68,68,0.05) !important; border-radius: 8px !important; }
    
    @media(max-width:900px){.settings-grid{grid-template-columns:1fr}}
  `]
})
export class AdminSystemComponent {
  freqs = [
    { id: 'daily', name: 'Hàng ngày (02:00 AM)' },
    { id: 'weekly', name: 'Hàng tuần (CN)' },
    { id: 'monthly', name: 'Hàng tháng (Ngày 1)' }
  ];

  storages = [
    { id: 's3', name: 'Amazon S3' },
    { id: 'local', name: 'Local Disk' },
    { id: 'gcs', name: 'Google Cloud Storage' }
  ];

  settings = {
    smtp: { enabled: true, host: 'smtp.gmail.com', port: '587', encryption: 'tls', username: 'alerts@urban-air.vn', password: '' },
    mqtt: { url: 'wss://broker.emqx.io:8084/mqtt', username: 'sensor_client', password: '', clientId: 'urban-air-web-' + Math.floor(Math.random() * 1000) },
    backup: { auto: true, frequency: 'daily', storage: 's3', retention: '30' },
    maintenanceMode: false
  };

  saveSettings() {
    notify({ message: 'Cấu hình hệ thống đã được lưu thay đổi.', type: 'success', displayTime: 3000 });
  }

  backupNow() {
    notify({ message: 'Tiến trình sao lưu cơ sở dữ liệu đã bắt đầu...', type: 'info', displayTime: 3000 });
  }

  clearCache() {
    notify({ message: 'Đã xóa cache hệ thống thành công.', type: 'success', displayTime: 3000 });
  }

  restart() {
    notify({ message: 'Đang khởi động lại services...', type: 'warning', displayTime: 4000 });
  }
}