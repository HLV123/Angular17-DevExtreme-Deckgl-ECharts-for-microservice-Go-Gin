import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, delay } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../models';
import { MOCK_USERS, MOCK_CREDENTIALS } from '../mock-data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'urban_air_token';
  private readonly USER_KEY = 'urban_air_user';

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSubject.next(user);
      } catch { this.logout(); }
    }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  login(req: LoginRequest): Observable<LoginResponse> {
    if (environment.useMockData) {
      const cred = MOCK_CREDENTIALS[req.email];
      if (cred && cred.password === req.password) {
        const user = MOCK_USERS.find(u => u.id === cred.userId)!;
        const response: LoginResponse = {
          accessToken: 'mock-jwt-' + Date.now(),
          refreshToken: 'mock-refresh-' + Date.now(),
          user,
          expiresIn: 3600,
        };
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return of(response).pipe(delay(500));
      }
      return throwError(() => new Error('Email hoặc mật khẩu không chính xác'));
    }
    return throwError(() => new Error('Backend chưa được kết nối'));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(roles: string[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  hasPermission(module: string, action: string): boolean {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;
    if (role === 'admin') return true;
    // Simplified permission check
    const permissions: Record<string, string[]> = {
      expert: ['stations', 'data', 'monitoring', 'map', 'alerts', 'forecast', 'analytics', 'sources'],
      operator: ['monitoring', 'map', 'alerts', 'community', 'analytics'],
      leader: ['monitoring', 'map', 'alerts', 'forecast', 'analytics'],
      citizen: ['monitoring', 'map', 'community'],
      partner: ['monitoring', 'map'],
    };
    return (permissions[role] || []).includes(module);
  }
}
