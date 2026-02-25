import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-wrapper">
      <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>
      <div class="main-area" [class.sidebar-collapsed]="sidebarCollapsed">
        <app-header (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed"></app-header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-wrapper { display: flex; min-height: 100vh; background: #0f172a; }
    .main-area {
      flex: 1; margin-left: 280px; transition: margin-left 0.3s ease;
      display: flex; flex-direction: column; min-height: 100vh;
    }
    .main-area.sidebar-collapsed { margin-left: 72px; }
    .main-content { flex: 1; padding: 24px 28px; }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = false;
}
