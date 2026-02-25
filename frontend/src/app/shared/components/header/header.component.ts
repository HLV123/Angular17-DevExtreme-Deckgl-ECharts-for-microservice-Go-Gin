import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { Alert } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <header class="top-header">
      <div class="header-left">
        <button class="toggle-btn" (click)="toggleSidebar.emit()">
          <i class="fas fa-bars"></i>
        </button>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" [placeholder]="'HEADER.SEARCH' | translate" [(ngModel)]="searchQuery" />
        </div>
      </div>
      <div class="header-right">
        <div class="live-indicator"><span class="live-dot"></span><span>LIVE</span></div>
        <button class="header-icon-btn" (click)="toggleLang()" [title]="'HEADER.LANGUAGE' | translate">
          <span class="lang-badge">{{ translate.currentLang === 'en' ? 'EN' : 'VI' }}</span>
        </button>
        <div class="notification-wrapper">
          <button class="header-icon-btn" (click)="showNotifications = !showNotifications; $event.stopPropagation()">
            <i class="fas fa-bell"></i>
            <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </button>
          <div class="notification-dropdown" *ngIf="showNotifications" (click)="$event.stopPropagation()">
            <div class="dropdown-header">
              <h4>{{ 'HEADER.NOTIFICATIONS' | translate }}</h4>
              <button class="mark-read" (click)="markAllRead()">Đã đọc tất cả</button>
            </div>
            <div class="notification-list">
              <div *ngFor="let alert of recentAlerts" class="notification-item">
                <div class="notif-icon" [ngClass]="'bg-' + alert.level">
                  <i [class]="getAlertIcon(alert.level)"></i>
                </div>
                <div class="notif-content">
                  <p class="notif-message">{{ alert.message }}</p>
                  <span class="notif-time">{{ getTimeAgo(alert.timestamp) }}</span>
                </div>
              </div>
            </div>
            <a routerLink="/alerts/active" class="view-all-link" (click)="showNotifications = false">
              {{ 'COMMON.VIEW_ALL' | translate }} <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
        <div class="user-menu-wrapper">
          <button class="user-menu-btn" (click)="showUserMenu = !showUserMenu; $event.stopPropagation()">
            <div class="avatar-sm">{{ auth.currentUser?.fullName?.charAt(0) || '?' }}</div>
            <span class="uname">{{ auth.currentUser?.fullName }}</span>
            <i class="fas fa-chevron-down chevron"></i>
          </button>
          <div class="user-dropdown" *ngIf="showUserMenu" (click)="$event.stopPropagation()">
            <a routerLink="/profile" class="dd-item" (click)="showUserMenu = false"><i class="fas fa-user"></i> {{ 'HEADER.PROFILE' | translate }}</a>
            <div class="dd-divider"></div>
            <button class="dd-item logout" (click)="logout()"><i class="fas fa-sign-out-alt"></i> {{ 'HEADER.LOGOUT' | translate }}</button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: 72px; background: rgba(15,23,42,0.85); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(51,65,85,0.4); display: flex; align-items: center;
      justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 50;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .toggle-btn {
      background: none; border: none; color: #94a3b8; cursor: pointer;
      font-size: 18px; padding: 8px; border-radius: 8px; transition: all 0.2s;
    }
    .toggle-btn:hover { background: rgba(148,163,184,0.1); color: white; }
    .search-box {
      background: rgba(30,41,59,0.8); border: 1px solid #334155; border-radius: 12px;
      padding: 8px 16px; display: flex; align-items: center; gap: 10px; transition: border-color 0.2s;
    }
    .search-box:focus-within { border-color: #38bdf8; }
    .search-box i { color: #64748b; font-size: 14px; }
    .search-box input {
      background: none; border: none; color: #e2e8f0; font-size: 13px; width: 240px;
      outline: none; font-family: 'DM Sans', sans-serif;
    }
    .search-box input::placeholder { color: #64748b; }
    .live-indicator {
      display: flex; align-items: center; gap: 6px; background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3); padding: 5px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.5px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
      animation: pulse-glow 1.5s ease-in-out infinite;
    }
    @keyframes pulse-glow { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .header-icon-btn {
      background: rgba(30,41,59,0.5); border: 1px solid #334155; color: #94a3b8;
      width: 40px; height: 40px; border-radius: 10px; cursor: pointer; position: relative;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 16px;
    }
    .header-icon-btn:hover { background: rgba(56,189,248,0.1); color: #38bdf8; border-color: rgba(56,189,248,0.3); }
    .lang-badge { font-size: 11px; font-weight: 700; }
    .badge-count {
      position: absolute; top: -4px; right: -4px; background: #ef4444; color: white;
      font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; padding: 0 4px;
    }
    .notification-wrapper, .user-menu-wrapper { position: relative; }
    .notification-dropdown {
      position: absolute; top: 50px; right: 0; width: 380px; background: #1e293b;
      border: 1px solid #334155; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      overflow: hidden; animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    .dropdown-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #334155;
    }
    .dropdown-header h4 { font-family: 'Outfit'; font-size: 15px; font-weight: 600; color: #f1f5f9; }
    .mark-read { background: none; border: none; color: #38bdf8; font-size: 12px; cursor: pointer; }
    .notification-list { max-height: 320px; overflow-y: auto; }
    .notification-item {
      display: flex; gap: 12px; padding: 14px 20px; border-bottom: 1px solid rgba(51,65,85,0.3);
      transition: background 0.2s; cursor: pointer;
    }
    .notification-item:hover { background: rgba(56,189,248,0.05); }
    .notif-icon {
      width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
      justify-content: center; font-size: 14px; flex-shrink: 0;
    }
    .notif-icon.bg-critical { background: rgba(239,68,68,0.15); color: #ef4444; }
    .notif-icon.bg-warning { background: rgba(249,115,22,0.15); color: #f97316; }
    .notif-icon.bg-info { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .notif-icon.bg-emergency { background: rgba(153,27,27,0.15); color: #fca5a5; }
    .notif-message { font-size: 13px; color: #e2e8f0; line-height: 1.4; margin-bottom: 4px; }
    .notif-time { font-size: 11px; color: #64748b; }
    .view-all-link {
      display: block; text-align: center; padding: 14px; color: #38bdf8; font-size: 13px;
      font-weight: 600; text-decoration: none; border-top: 1px solid #334155; transition: background 0.2s;
    }
    .view-all-link:hover { background: rgba(56,189,248,0.05); }
    .user-menu-btn {
      display: flex; align-items: center; gap: 10px; background: rgba(30,41,59,0.5);
      border: 1px solid #334155; padding: 6px 14px 6px 6px; border-radius: 12px;
      cursor: pointer; transition: all 0.2s;
    }
    .user-menu-btn:hover { border-color: rgba(56,189,248,0.3); }
    .avatar-sm {
      width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,#0ea5e9,#22c55e);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: white;
    }
    .uname { font-size: 13px; font-weight: 500; color: #e2e8f0; }
    .chevron { font-size: 10px; color: #64748b; }
    .user-dropdown {
      position: absolute; top: 50px; right: 0; width: 200px; background: #1e293b;
      border: 1px solid #334155; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.4);
      overflow: hidden; animation: fadeIn 0.2s ease;
    }
    .dd-item {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #94a3b8;
      font-size: 13px; text-decoration: none; transition: all 0.2s; width: 100%;
      background: none; border: none; cursor: pointer; text-align: left;
    }
    .dd-item:hover { background: rgba(56,189,248,0.08); color: #e2e8f0; }
    .dd-item.logout { color: #ef4444; }
    .dd-divider { height: 1px; background: #334155; }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  unreadCount = 5;
  recentAlerts: Alert[] = [];

  constructor(
    public auth: AuthService,
    private alertService: AlertService,
    public translate: TranslateService
  ) {
    translate.setDefaultLang('vi');
    translate.use('vi');
  }

  ngOnInit() {
    this.alertService.getRecentAlerts(5).subscribe(alerts => this.recentAlerts = alerts);
    document.addEventListener('click', () => {
      this.showNotifications = false;
      this.showUserMenu = false;
    });
  }

  toggleLang() {
    const newLang = this.translate.currentLang === 'vi' ? 'en' : 'vi';
    this.translate.use(newLang);
  }
  markAllRead() { this.unreadCount = 0; }
  logout() { this.auth.logout(); }

  getAlertIcon(level: string): string {
    const icons: Record<string, string> = {
      critical: 'fas fa-exclamation-circle', warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle', emergency: 'fas fa-radiation',
    };
    return icons[level] || 'fas fa-bell';
  }

  getTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  }
}
