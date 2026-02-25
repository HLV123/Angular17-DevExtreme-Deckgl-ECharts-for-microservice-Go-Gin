import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Station } from '../models';
import { MOCK_STATIONS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class StationService {
  getStations(): Observable<Station[]> {
    return of(MOCK_STATIONS).pipe(delay(300));
  }

  getStationById(id: string): Observable<Station | undefined> {
    return of(MOCK_STATIONS.find(s => s.id === id)).pipe(delay(200));
  }

  getStationsByDistrict(district: string): Observable<Station[]> {
    return of(MOCK_STATIONS.filter(s => s.district === district)).pipe(delay(200));
  }

  getStationsByStatus(status: string): Observable<Station[]> {
    return of(MOCK_STATIONS.filter(s => s.status === status)).pipe(delay(200));
  }
}
