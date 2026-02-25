import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  roles?: string[];
  divider?: boolean;
  sectionLabel?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="logo-area">
        <img src="assets/logo.png" alt="Urban Air" class="logo-img" />
        <div class="logo-text" *ngIf="!collapsed">
          <h2>Urban Air</h2>
          <p>Air Quality Platform</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-container">
        <ng-container *ngFor="let item of navItems">
          <div *ngIf="item.sectionLabel && !collapsed && isVisible(item)" class="nav-section-label">
            {{ item.sectionLabel | translate }}
          </div>
          <div *ngIf="item.divider" class="nav-divider"></div>

          <!-- Single item -->
          <a *ngIf="item.route && isVisible(item)"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
             class="nav-link"
             [title]="item.label | translate">
            <i [class]="item.icon"></i>
            <span *ngIf="!collapsed">{{ item.label | translate }}</span>
          </a>

          <!-- Group with children -->
          <div *ngIf="item.children && isVisible(item)" class="nav-group">
            <button class="nav-link nav-group-toggle" (click)="toggleGroup(item.label)" [title]="item.label | translate">
              <i [class]="item.icon"></i>
              <span *ngIf="!collapsed">{{ item.label | translate }}</span>
              <i *ngIf="!collapsed" class="fas fa-chevron-down toggle-icon" [class.rotated]="expandedGroups[item.label]"></i>
            </button>
            <div class="nav-children" *ngIf="expandedGroups[item.label] && !collapsed">
              <ng-container *ngFor="let child of item.children">
                <a *ngIf="isVisible(child)"
                   [routerLink]="child.route"
                   routerLinkActive="active"
                   class="nav-link child-link">
                  <i [class]="child.icon"></i>
                  <span>{{ child.label | translate }}</span>
                </a>
              </ng-container>
            </div>
          </div>
        </ng-container>
      </nav>

      <!-- User info at bottom -->
      <div class="sidebar-footer" *ngIf="!collapsed && auth.currentUser">
        <div class="user-mini">
          <div class="user-avatar">{{ auth.currentUser.fullName.charAt(0) }}</div>
          <div class="user-info">
            <span class="user-name">{{ auth.currentUser.fullName }}</span>
            <span class="user-role">{{ getRoleLabel(auth.currentUser.role) }}</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      min-width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #0c1929 0%, #0a1220 40%, #0f172a 100%);
      border-right: 1px solid rgba(51, 65, 85, 0.4);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      overflow-y: auto;
      overflow-x: hidden;
      transition: width 0.3s ease;
    }
    .sidebar.collapsed { width: 72px; min-width: 72px; }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 24px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.3);
      margin-bottom: 8px;
    }
    .logo-img { width: 42px; height: 42px; border-radius: 12px; }
    .logo-text h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #22c55e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }
    .logo-text p { font-size: 11px; color: #64748b; margin-top: 2px; }

    .nav-container { flex: 1; padding: 4px 12px; }

    .nav-section-label {
      padding: 16px 16px 6px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #475569;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }

    .nav-divider { height: 1px; background: rgba(51, 65, 85, 0.3); margin: 8px 12px; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s ease;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      position: relative;
      margin-bottom: 2px;
    }
    .nav-link:hover { background: rgba(56, 189, 248, 0.08); color: #e2e8f0; }
    .nav-link.active {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(34, 197, 94, 0.1));
      color: #38bdf8;
      border-left: 3px solid #38bdf8;
    }
    .nav-link i { width: 18px; font-size: 14px; text-align: center; flex-shrink: 0; }

    .toggle-icon { margin-left: auto; font-size: 10px; transition: transform 0.2s; }
    .toggle-icon.rotated { transform: rotate(180deg); }

    .child-link { padding-left: 48px; font-size: 13px; }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
    }
    .user-mini { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0ea5e9, #22c55e);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: white;
    }
    .user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; display: block; }
    .user-role { font-size: 11px; color: #64748b; }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  expandedGroups: Record<string, boolean> = { 'Bản đồ': true };

  navItems: NavItem[] = [
    { label: 'SIDEBAR.DASHBOARD', icon: 'fas fa-chart-line', route: '/dashboard' },
    { sectionLabel: 'SIDEBAR.MONITORING', divider: true, label: '', icon: '' },
    {
      label: 'Bản đồ', icon: 'fas fa-map-marked-alt', children: [
        { label: 'Thời gian thực', icon: 'fas fa-broadcast-tower', route: '/map/realtime' },
        { label: 'Lịch sử', icon: 'fas fa-history', route: '/map/history' },
        { label: 'Dự báo', icon: 'fas fa-cloud-sun', route: '/map/forecast', roles: ['admin', 'expert', 'leader'] },
        { label: 'SIDEBAR.POLLUTION_SOURCES', icon: 'fas fa-industry', route: '/map/sources', roles: ['admin', 'expert', 'operator', 'leader'] },
        { label: 'Bản đồ 3D', icon: 'fas fa-cube', route: '/map/3d' },
      ]
    },
    {
      label: 'Giám sát AQI', icon: 'fas fa-tachometer-alt', children: [
        { label: 'Realtime', icon: 'fas fa-signal', route: '/monitoring/realtime' },
        { label: 'So sánh trạm', icon: 'fas fa-columns', route: '/monitoring/compare' },
      ]
    },
    {
      label: 'SIDEBAR.ALERTS', icon: 'fas fa-exclamation-triangle', roles: ['admin', 'expert', 'operator', 'leader'], children: [
        { label: 'Đang hoạt động', icon: 'fas fa-bell', route: '/alerts/active' },
        { label: 'Lịch sử', icon: 'fas fa-archive', route: '/alerts/history' },
        { label: 'Cấu hình', icon: 'fas fa-cog', route: '/alerts/config', roles: ['admin', 'expert'] },
      ]
    },
    { sectionLabel: 'SIDEBAR.ANALYTICS', divider: true, label: '', icon: '', roles: ['admin', 'expert', 'operator', 'leader'] },
    {
      label: 'SIDEBAR.FORECAST', icon: 'fas fa-brain', roles: ['admin', 'expert', 'leader'], children: [
        { label: 'Dashboard dự báo', icon: 'fas fa-chart-area', route: '/forecast/dashboard' },
        { label: 'Mô hình ML', icon: 'fas fa-project-diagram', route: '/forecast/models', roles: ['admin', 'expert'] },
        { label: 'Đánh giá', icon: 'fas fa-check-double', route: '/forecast/evaluation' },
      ]
    },
    {
      label: 'Phân tích dữ liệu', icon: 'fas fa-chart-bar', roles: ['admin', 'expert', 'operator', 'leader'], children: [
        { label: 'Báo cáo', icon: 'fas fa-file-alt', route: '/analytics/reports' },
        { label: 'Xu hướng', icon: 'fas fa-chart-line', route: '/analytics/trends' },
        { label: 'Tuân thủ Quy chuẩn', icon: 'fas fa-check-double', route: '/analytics/compliance' },
      ]
    },
    { sectionLabel: 'Quản lý', divider: true, label: '', icon: '', roles: ['admin', 'expert', 'operator', 'citizen'] },
    {
      label: 'SIDEBAR.STATIONS', icon: 'fas fa-broadcast-tower', roles: ['admin', 'expert', 'operator'], children: [
        { label: 'Danh sách trạm', icon: 'fas fa-list', route: '/stations/list' },
        { label: 'Thiết bị & Bảo trì', icon: 'fas fa-tools', route: '/stations/devices' },
        { label: 'SIDEBAR.DATA_IMPORT', icon: 'fas fa-file-import', route: '/data-import' }
      ]
    },
    { label: 'SIDEBAR.POLLUTION_SOURCES', icon: 'fas fa-smog', route: '/sources', roles: ['admin', 'expert'] },
    {
      label: 'Phản ánh CĐ', icon: 'fas fa-users', roles: ['admin', 'operator', 'citizen'], children: [
        { label: 'Gửi phản ánh', icon: 'fas fa-paper-plane', route: '/community/submit', roles: ['citizen', 'admin'] },
        { label: 'Quản lý', icon: 'fas fa-tasks', route: '/community/manage', roles: ['admin', 'operator'] },
        { label: 'Tra cứu & Bản đồ', icon: 'fas fa-search-location', route: '/community/lookup' },
      ]
    },
    { sectionLabel: 'Hệ thống', divider: true, label: '', icon: '', roles: ['admin'] },
    {
      label: 'SIDEBAR.SETTINGS', icon: 'fas fa-shield-alt', roles: ['admin'], children: [
        { label: 'Người dùng', icon: 'fas fa-users-cog', route: '/admin/users' },
        { label: 'Vai trò & Quyền', icon: 'fas fa-user-tag', route: '/admin/roles' },
        { label: 'API Keys', icon: 'fas fa-key', route: '/admin/api-keys' },
        { label: 'Webhooks', icon: 'fas fa-satellite-dish', route: '/admin/webhooks' },
        { label: 'Tích hợp', icon: 'fas fa-plug', route: '/admin/integrations' },
        { label: 'Cấu hình chung', icon: 'fas fa-sliders-h', route: '/admin/system' },
        { label: 'Trạng thái (Health)', icon: 'fas fa-heartbeat', route: '/admin/health' },
        { label: 'Nhật ký Hệ thống', icon: 'fas fa-clipboard-list', route: '/admin/audit-log' },
      ]
    },
  ];

  constructor(public auth: AuthService) { }

  toggleGroup(label: string): void {
    this.expandedGroups[label] = !this.expandedGroups[label];
  }

  isVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.auth.hasRole(item.roles);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Quản trị viên', expert: 'Chuyên gia', operator: 'Cán bộ vận hành',
      leader: 'Lãnh đạo', citizen: 'Người dân', partner: 'Đối tác'
    };
    return labels[role] || role;
  }
}
