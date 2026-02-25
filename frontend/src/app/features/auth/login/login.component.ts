import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <img src="assets/logo.png" alt="Urban Air" class="login-logo" />
            <h1>Urban Air</h1>
            <p>Hệ thống Quản lý & Dự báo Chất lượng Không khí</p>
          </div>

          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input type="email" [(ngModel)]="email" name="email" placeholder="Nhập email..." required />
              </div>
            </div>

            <div class="form-group">
              <label>Mật khẩu</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Nhập mật khẩu..." required />
                <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="error-msg" *ngIf="errorMessage">
              <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
            </div>

            <button type="submit" class="login-btn" [disabled]="loading">
              <span *ngIf="!loading">Đăng nhập</span>
              <i *ngIf="loading" class="fas fa-spinner fa-spin"></i>
            </button>
          </form>

          <div class="demo-accounts">
            <h4>Tài khoản demo</h4>
            <div class="demo-grid">
              <button *ngFor="let acc of demoAccounts" (click)="fillDemo(acc)" class="demo-btn">
                <i [class]="acc.icon"></i>
                <div>
                  <span class="demo-role">{{ acc.label }}</span>
                  <span class="demo-email">{{ acc.email }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="login-footer">
          <p>© 2025 Urban Air · Smart City Air Quality Platform</p>
          <p class="tech-stack">
            <i class="fas fa-leaf"></i> Angular 17 · Go · TimescaleDB · MQTT · AI/ML
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #060d1a; position: relative; overflow: hidden;
    }
    .login-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-orb {
      position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15;
    }
    .orb-1 { width: 600px; height: 600px; background: #0ea5e9; top: -200px; left: -100px; }
    .orb-2 { width: 500px; height: 500px; background: #22c55e; bottom: -150px; right: -100px; }
    .orb-3 { width: 300px; height: 300px; background: #8b5cf6; top: 50%; left: 50%; transform: translate(-50%,-50%); }

    .login-container { position: relative; z-index: 1; width: 100%; max-width: 460px; padding: 20px; }

    .login-card {
      background: rgba(15,23,42,0.9); backdrop-filter: blur(40px);
      border: 1px solid rgba(51,65,85,0.5); border-radius: 24px;
      padding: 40px 36px; box-shadow: 0 25px 80px rgba(0,0,0,0.5);
    }

    .login-header { text-align: center; margin-bottom: 32px; }
    .login-logo { width: 72px; height: 72px; border-radius: 20px; margin-bottom: 16px; }
    .login-header h1 {
      font-family: 'Outfit'; font-size: 28px; font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #22c55e);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .login-header p { color: #64748b; font-size: 13px; margin-top: 4px; }

    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
    .input-wrapper {
      display: flex; align-items: center; background: rgba(30,41,59,0.8);
      border: 1px solid #334155; border-radius: 12px; padding: 0 14px;
      transition: border-color 0.2s;
    }
    .input-wrapper:focus-within { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }
    .input-wrapper i { color: #64748b; font-size: 14px; }
    .input-wrapper input {
      flex: 1; background: none; border: none; color: #e2e8f0; padding: 12px 10px;
      font-size: 14px; outline: none; font-family: 'DM Sans';
    }
    .toggle-pass { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }

    .error-msg {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; padding: 10px 14px; border-radius: 10px; font-size: 13px;
      margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
    }

    .login-btn {
      width: 100%; padding: 14px; border: none; border-radius: 12px;
      background: linear-gradient(135deg, #0ea5e9, #22c55e);
      color: white; font-size: 15px; font-weight: 700; cursor: pointer;
      transition: all 0.3s; font-family: 'Outfit';
    }
    .login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(14,165,233,0.3); }
    .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .demo-accounts {
      margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(51,65,85,0.4);
    }
    .demo-accounts h4 {
      font-family: 'Outfit'; font-size: 13px; color: #64748b; text-align: center;
      margin-bottom: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .demo-btn {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      background: rgba(30,41,59,0.5); border: 1px solid #334155; border-radius: 10px;
      cursor: pointer; transition: all 0.2s; text-align: left;
    }
    .demo-btn:hover { border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.05); }
    .demo-btn i { color: #38bdf8; font-size: 16px; width: 20px; text-align: center; }
    .demo-role { display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; }
    .demo-email { display: block; font-size: 10px; color: #64748b; }

    .login-footer { text-align: center; margin-top: 24px; color: #475569; font-size: 12px; }
    .tech-stack { margin-top: 6px; font-size: 11px; color: #334155; }
    .tech-stack i { color: #22c55e; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  demoAccounts = [
    { email: 'admin@urbanair.vn', password: 'admin123', label: 'Quản trị viên', icon: 'fas fa-shield-alt' },
    { email: 'expert@urbanair.vn', password: 'expert123', label: 'Chuyên gia', icon: 'fas fa-microscope' },
    { email: 'operator@urbanair.vn', password: 'operator123', label: 'Cán bộ vận hành', icon: 'fas fa-headset' },
    { email: 'leader@urbanair.vn', password: 'leader123', label: 'Lãnh đạo', icon: 'fas fa-crown' },
    { email: 'citizen@urbanair.vn', password: 'citizen123', label: 'Người dân', icon: 'fas fa-user' },
  ];

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    if (auth.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  fillDemo(acc: { email: string; password: string }) {
    this.email = acc.email;
    this.password = acc.password;
    this.errorMessage = '';
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }
}
