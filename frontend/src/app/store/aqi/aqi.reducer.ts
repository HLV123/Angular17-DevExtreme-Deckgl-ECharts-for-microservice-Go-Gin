import { createReducer, on } from '@ngrx/store';
import { AqiReading } from '../../core/models';
import * as AqiActions from './aqi.actions';

export interface AqiState { readings: AqiReading[]; loading: boolean; error: string | null; lastUpdated: string | null; }
export const initialState: AqiState = { readings: [], loading: false, error: null, lastUpdated: null };

export const aqiReducer = createReducer(initialState,
  on(AqiActions.loadCurrentAqi, state => ({ ...state, loading: true })),
  on(AqiActions.loadCurrentAqiSuccess, (state, { readings }) => ({ ...state, readings, loading: false, error: null, lastUpdated: new Date().toISOString() })),
  on(AqiActions.loadCurrentAqiFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AqiActions.updateAqiRealtime, (state, { reading }) => ({
    ...state, readings: state.readings.map(r => r.stationId === reading.stationId ? reading : r), lastUpdated: new Date().toISOString()
  }))
);
