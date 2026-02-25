import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Webhook {
  id: string; url: string; events: string[]; isActive: boolean;
  secret: string; createdAt: string; lastDelivery?: string;
  deliveryCount: number; failureCount: number;
}

@Injectable({ providedIn: 'root' })
export class WebhookService {
  private webhooks: Webhook[] = [
    { id: 'WH001', url: 'https://partner-a.com/api/webhook', events: ['alert.new', 'alert.closed'], isActive: true, secret: 'whsec_abc123...', createdAt: '2025-01-15', lastDelivery: '2 phút trước', deliveryCount: 4521, failureCount: 12 },
    { id: 'WH002', url: 'https://city-gov.vn/api/aqi-notify', events: ['data.hourly', 'report.ready'], isActive: true, secret: 'whsec_def456...', createdAt: '2025-03-01', lastDelivery: '1 giờ trước', deliveryCount: 2100, failureCount: 3 },
    { id: 'WH003', url: 'https://research-lab.edu.vn/callback', events: ['alert.new', 'data.hourly'], isActive: false, secret: 'whsec_ghi789...', createdAt: '2025-05-10', lastDelivery: '3 ngày trước', deliveryCount: 890, failureCount: 45 },
  ];

  getWebhooks(): Observable<Webhook[]> { return of(this.webhooks); }
  testWebhook(id: string): Observable<{ success: boolean; statusCode: number; responseTime: number }> {
    return of({ success: Math.random() > 0.2, statusCode: Math.random() > 0.2 ? 200 : 500, responseTime: Math.round(50 + Math.random() * 400) });
  }
}
