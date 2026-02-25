import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Alert, AlertConfig } from '../models';
import { MOCK_ALERTS, MOCK_ALERT_CONFIGS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AlertService {
  getAlerts(): Observable<Alert[]> {
    return of(MOCK_ALERTS).pipe(delay(300));
  }

  getActiveAlerts(): Observable<Alert[]> {
    return of(MOCK_ALERTS.filter(a => ['new', 'acknowledged', 'in_progress'].includes(a.status))).pipe(delay(200));
  }

  getAlertConfigs(): Observable<AlertConfig[]> {
    return of(MOCK_ALERT_CONFIGS).pipe(delay(200));
  }

  getRecentAlerts(count: number = 5): Observable<Alert[]> {
    return of(MOCK_ALERTS.slice(0, count)).pipe(delay(200));
  }
}
