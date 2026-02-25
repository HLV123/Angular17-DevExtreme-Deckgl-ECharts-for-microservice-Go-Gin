import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="page animate-fade-in"><div class="pg-hdr"><h1><i class="fas fa-user-circle"></i> Hồ sơ & Cài đặt</h1></div>
    <div class="profile-grid">
      <div class="profile-card">
        <div class="avatar-lg">{{user?.fullName?.charAt(0)||'?'}}</div>
        <h2>{{user?.fullName}}</h2><p class="role-badge">{{roleLbl(user?.role||'')}}</p><p class="email">{{user?.email}}</p>
        <div class="prof-info"><div class="pi"><span>Đơn vị</span><b>{{user?.department}}</b></div>
          <div class="pi"><span>Số điện thoại</span><b>{{user?.phone||'Chưa cập nhật'}}</b></div>
          <div class="pi"><span>Lần đăng nhập cuối</span><b>{{user?.lastLoginAt ? formatDate(user.lastLoginAt) : 'N/A'}}</b></div></div>
        <button class="btn-upload"><i class="fas fa-camera"></i> Đổi avatar</button>
      </div>
      <div class="settings-col">
        <div class="settings-card"><h3><i class="fas fa-lock"></i> Đổi mật khẩu</h3>
          <div class="fg"><label>Mật khẩu hiện tại</label><input type="password" [(ngModel)]="oldPw" class="input" placeholder="••••••"/></div>
          <div class="fg"><label>Mật khẩu mới</label><input type="password" [(ngModel)]="newPw" class="input" placeholder="Tối thiểu 8 ký tự"/></div>
          <div class="fg"><label>Xác nhận mật khẩu</label><input type="password" [(ngModel)]="confirmPw" class="input" placeholder="Nhập lại mật khẩu mới"/></div>
          <div class="pw-rules"><span [class.ok]="newPw.length>=8"><i class="fas" [ngClass]="newPw.length>=8?'fa-check':'fa-times'"></i> ≥ 8 ký tự</span>
            <span [class.ok]="hasUpper"><i class="fas" [ngClass]="hasUpper?'fa-check':'fa-times'"></i> Chữ hoa</span>
            <span [class.ok]="hasNumber"><i class="fas" [ngClass]="hasNumber?'fa-check':'fa-times'"></i> Số</span>
            <span [class.ok]="newPw===confirmPw&&newPw.length>0"><i class="fas" [ngClass]="newPw===confirmPw&&newPw.length>0?'fa-check':'fa-times'"></i> Khớp</span></div>
          <button class="btn-primary" [disabled]="!canChangePw"><i class="fas fa-save"></i> Đổi mật khẩu</button>
        </div>
        <div class="settings-card"><h3><i class="fas fa-globe"></i> Ngôn ngữ & Giao diện</h3>
          <div class="option-row"><span>Ngôn ngữ</span><select [(ngModel)]="lang" class="sel"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></div>
          <div class="option-row"><span>Theme</span><select [(ngModel)]="theme" class="sel"><option value="dark">Dark</option><option value="light">Light</option></select></div>
          <div class="option-row"><span>Trang chủ mặc định</span><select [(ngModel)]="homepage" class="sel"><option value="/dashboard">Dashboard</option><option value="/map/realtime">Bản đồ</option><option value="/monitoring/realtime">Giám sát</option></select></div>
        </div>
        <div class="settings-card"><h3><i class="fas fa-bell"></i> Cài đặt Thông báo</h3>
          <div class="notif-row"><span>In-app notification</span><label class="switch"><input type="checkbox" [(ngModel)]="notif.inApp" checked/><span class="slider"></span></label></div>
          <div class="notif-row"><span>Email khi cảnh báo Warning+</span><label class="switch"><input type="checkbox" [(ngModel)]="notif.email"/><span class="slider"></span></label></div>
          <div class="notif-row"><span>SMS khi cảnh báo Critical+</span><label class="switch"><input type="checkbox" [(ngModel)]="notif.sms"/><span class="slider"></span></label></div>
          <div class="notif-row"><span>Push notification (PWA)</span><label class="switch"><input type="checkbox" [(ngModel)]="notif.push"/><span class="slider"></span></label></div>
          <div class="notif-levels"><span class="nl-title">Nhận cảnh báo cấp:</span>
            <label *ngFor="let l of alertLevels"><input type="checkbox" [(ngModel)]="l.checked"/> {{l.label}}</label></div>
        </div>
        <div class="settings-card"><h3><i class="fas fa-shield-alt"></i> Bảo mật</h3>
          <div class="option-row"><span>Xác thực 2 bước (TOTP)</span><button class="btn-outline">Kích hoạt</button></div>
          <div class="option-row"><span>Session đang hoạt động</span><span class="session-count">{{sessions}} thiết bị</span></div>
          <button class="btn-danger"><i class="fas fa-sign-out-alt"></i> Đăng xuất tất cả thiết bị khác</button>
        </div>
      </div>
    </div></div>`,
  styles: [`.pg-hdr{margin-bottom:20px}.pg-hdr h1{font-family:'Outfit';font-size:22px;color:#f1f5f9;display:flex;align-items:center;gap:10px}.pg-hdr h1 i{color:#38bdf8}
    .profile-grid{display:grid;grid-template-columns:280px 1fr;gap:16px}
    .profile-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:16px;padding:28px;text-align:center}
    .avatar-lg{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#0ea5e9,#22c55e);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff;margin:0 auto 14px}
    .profile-card h2{font-family:'Outfit';font-size:18px;color:#f1f5f9;margin-bottom:6px}.role-badge{background:rgba(56,189,248,.1);color:#38bdf8;display:inline-block;padding:4px 14px;border-radius:10px;font-size:12px;font-weight:700;margin-bottom:4px}.email{font-size:12px;color:#64748b;margin-bottom:16px}
    .prof-info{text-align:left;margin-bottom:14px}.pi{display:flex;justify-content:space-between;padding:8px;background:rgba(15,23,42,.4);border-radius:8px;font-size:11px;color:#64748b;margin-bottom:4px}.pi b{color:#cbd5e1}
    .btn-upload{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:6px;margin:0 auto}
    .settings-col{display:flex;flex-direction:column;gap:14px}
    .settings-card{background:rgba(30,41,59,.6);border:1px solid rgba(51,65,85,.4);border-radius:14px;padding:20px}
    .settings-card h3{font-family:'Outfit';font-size:14px;color:#e2e8f0;margin-bottom:14px;display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(51,65,85,.3)}.settings-card h3 i{color:#38bdf8;font-size:13px}
    .fg{margin-bottom:10px}.fg label{display:block;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:4px}.input{width:100%;background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:9px 12px;border-radius:8px;font-size:12px;outline:none;box-sizing:border-box}.input:focus{border-color:#38bdf8}
    .pw-rules{display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap}.pw-rules span{font-size:10px;color:#ef4444;display:flex;align-items:center;gap:4px}.pw-rules span.ok{color:#22c55e}
    .btn-primary{background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#fff;border:none;padding:9px 18px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px}.btn-primary:disabled{opacity:.4;cursor:not-allowed}
    .option-row{display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(15,23,42,.4);border-radius:8px;font-size:12px;color:#cbd5e1;margin-bottom:6px}
    .sel{background:rgba(15,23,42,.6);border:1px solid #334155;color:#e2e8f0;padding:6px 10px;border-radius:6px;font-size:11px}
    .notif-row{display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(15,23,42,.4);border-radius:8px;font-size:12px;color:#cbd5e1;margin-bottom:6px}
    .switch{position:relative;width:40px;height:22px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#334155;border-radius:22px;transition:.3s}.slider:before{content:'';position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}.switch input:checked+.slider{background:#22c55e}.switch input:checked+.slider:before{transform:translateX(18px)}
    .notif-levels{padding:10px;background:rgba(15,23,42,.4);border-radius:8px;margin-top:6px}.nl-title{display:block;font-size:11px;color:#64748b;margin-bottom:6px}.notif-levels label{font-size:11px;color:#cbd5e1;margin-right:14px}
    .btn-outline{background:none;border:1px solid rgba(56,189,248,.3);color:#38bdf8;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600}
    .session-count{font-size:12px;color:#a78bfa;font-weight:600}
    .btn-danger{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:6px;margin-top:8px}
    @media(max-width:768px){.profile-grid{grid-template-columns:1fr}}`]
})
export class ProfileComponent implements OnInit {
  user: any; oldPw=''; newPw=''; confirmPw=''; lang='vi'; theme='dark'; homepage='/dashboard'; sessions=2;
  notif = { inApp: true, email: true, sms: false, push: true };
  alertLevels = [{label:'Emergency',checked:true},{label:'Critical',checked:true},{label:'Warning',checked:true},{label:'Info',checked:false}];
  constructor(private auth: AuthService) {}
  ngOnInit() { this.user = this.auth.currentUser; }
  get hasUpper() { return /[A-Z]/.test(this.newPw); }
  get hasNumber() { return /[0-9]/.test(this.newPw); }
  get canChangePw() { return this.oldPw && this.newPw.length >= 8 && this.hasUpper && this.hasNumber && this.newPw === this.confirmPw; }
  roleLbl(r: string) { return {admin:'Quản trị viên',expert:'Chuyên gia',operator:'Vận hành',leader:'Lãnh đạo',citizen:'Người dân'}[r]||r; }
  formatDate(d: string) { return new Date(d).toLocaleString('vi-VN'); }
}
