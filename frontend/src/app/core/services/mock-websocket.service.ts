import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, interval, Subscription } from 'rxjs';
import { AqiReading } from '../models';
import { generateCurrentAqi } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class MockWebSocketService implements OnDestroy {
  private aqiSubject = new Subject<AqiReading[]>();
  private alertSubject = new Subject<any>();
  private stationStatusSubject = new Subject<any>();
  private subscriptions: Subscription[] = [];

  aqiRealtime$ = this.aqiSubject.asObservable();
  alertsLive$ = this.alertSubject.asObservable();
  stationStatus$ = this.stationStatusSubject.asObservable();

  startSimulation(): void {
    // Push AQI every 30 seconds
    this.subscriptions.push(
      interval(30000).subscribe(() => {
        this.aqiSubject.next(generateCurrentAqi());
      })
    );
    // Push random alert every 2 minutes
    this.subscriptions.push(
      interval(120000).subscribe(() => {
        this.alertSubject.next({
          id: 'ALT-LIVE-' + Date.now(),
          stationName: ['Hoàn Kiếm', 'Tây Hồ', 'Đống Đa', 'Thanh Xuân'][Math.floor(Math.random() * 4)],
          level: ['warning', 'critical'][Math.floor(Math.random() * 2)],
          message: 'Cảnh báo realtime - AQI biến động',
          timestamp: new Date().toISOString(),
        });
      })
    );
  }

  stopSimulation(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy(): void { this.stopSimulation(); }
}
