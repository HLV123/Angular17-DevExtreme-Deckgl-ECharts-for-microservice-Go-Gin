import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  generateStations,
  generateCurrentAqi,
  generateAlerts,
  generateReportList,
  generateSystemHealth,
  generatePollutionSources,
} from '../mock-data';
import { environment } from '../../../environments/environment';

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const url = request.url;

    if (!environment.useMockData) {
      return next.handle(request);
    }

    if (url.includes('/api/v1/stations') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generateStations() })).pipe(delay(500));
    }

    if (url.includes('/api/v1/aqi/current') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generateCurrentAqi() })).pipe(delay(300));
    }

    if (url.includes('/api/v1/alerts') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generateAlerts() })).pipe(delay(400));
    }

    if (url.includes('/api/v1/reports') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generateReportList() })).pipe(delay(200));
    }

    if (url.includes('/api/v1/system/health') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generateSystemHealth() })).pipe(delay(600));
    }

    if (url.includes('/api/v1/map/pollution-sources') && request.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: generatePollutionSources() })).pipe(delay(300));
    }

    // Default pass-through if not mocked
    return next.handle(request);
  }
}
