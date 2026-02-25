import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MqttMessage { topic: string; payload: any; timestamp: Date; }

@Injectable({ providedIn: 'root' })
export class MqttService implements OnDestroy {
  private client: any = null;
  private messageSubject = new Subject<MqttMessage>();
  private connectionSubject = new Subject<boolean>();
  private subscriptions: string[] = [];

  get messages$(): Observable<MqttMessage> { return this.messageSubject.asObservable(); }
  get connected$(): Observable<boolean> { return this.connectionSubject.asObservable(); }

  async connect(): Promise<void> {
    if (environment.useMockData) {
      console.log('[MQTT] Mock mode - simulating connection');
      this.connectionSubject.next(true);
      this.startMockPublisher();
      return;
    }
    try {
      const mqtt = await import('mqtt');
      const brokerUrl = environment.mqttUrl || 'ws://localhost:9001/mqtt';
      this.client = mqtt.connect(brokerUrl, {
        clientId: `urbanair_web_${Date.now()}`,
        clean: true, connectTimeout: 5000, reconnectPeriod: 3000
      });
      this.client.on('connect', () => { this.connectionSubject.next(true); this.resubscribe(); });
      this.client.on('message', (topic: string, message: Buffer) => {
        try {
          const payload = JSON.parse(message.toString());
          this.messageSubject.next({ topic, payload, timestamp: new Date() });
        } catch (e) { console.warn('[MQTT] Parse error', e); }
      });
      this.client.on('error', (err: any) => { console.error('[MQTT] Error:', err); this.connectionSubject.next(false); });
      this.client.on('offline', () => this.connectionSubject.next(false));
    } catch (e) { console.warn('[MQTT] Connection failed, falling back to mock', e); this.startMockPublisher(); }
  }

  subscribe(topic: string): void {
    if (!this.subscriptions.includes(topic)) this.subscriptions.push(topic);
    this.client?.subscribe(topic, { qos: 1 });
  }

  publish(topic: string, payload: any): void {
    this.client?.publish(topic, JSON.stringify(payload), { qos: 1 });
  }

  private resubscribe(): void { this.subscriptions.forEach(t => this.client?.subscribe(t, { qos: 1 })); }

  private startMockPublisher(): void {
    setInterval(() => {
      this.messageSubject.next({
        topic: 'hn/station/ST001/data',
        payload: { aqi: 50 + Math.round(Math.random() * 100), pm25: 20 + Math.random() * 60, timestamp: new Date().toISOString() },
        timestamp: new Date()
      });
    }, 10000);
  }

  ngOnDestroy(): void { this.client?.end(true); this.messageSubject.complete(); this.connectionSubject.complete(); }
}
