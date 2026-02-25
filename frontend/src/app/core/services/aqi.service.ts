import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AqiReading } from '../models';
import { generateCurrentAqi, generateHourlyData, generateDailyData, generateCityAverage24h } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AqiService {
  getCurrentAqi(): Observable<AqiReading[]> {
    return of(generateCurrentAqi()).pipe(delay(300));
  }

  getHourlyData(stationId: string, hours: number = 24): Observable<AqiReading[]> {
    return of(generateHourlyData(stationId, hours)).pipe(delay(300));
  }

  getDailyData(stationId: string, days: number = 30): Observable<AqiReading[]> {
    return of(generateDailyData(stationId, days)).pipe(delay(300));
  }

  getCityAverage24h(): Observable<{ hours: string[]; cityData: number[]; centerData: number[] }> {
    return of(generateCityAverage24h()).pipe(delay(200));
  }
}
