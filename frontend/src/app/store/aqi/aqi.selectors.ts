import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AqiState } from './aqi.reducer';

export const selectAqiState = createFeatureSelector<AqiState>('aqi');
export const selectAllReadings = createSelector(selectAqiState, s => s.readings);
export const selectAqiLoading = createSelector(selectAqiState, s => s.loading);
export const selectLastUpdated = createSelector(selectAqiState, s => s.lastUpdated);
export const selectAverageAqi = createSelector(selectAllReadings, r => r.length ? Math.round(r.reduce((s, x) => s + x.aqi, 0) / r.length) : 0);
export const selectReadingByStation = (id: string) => createSelector(selectAllReadings, r => r.find(x => x.stationId === id));
