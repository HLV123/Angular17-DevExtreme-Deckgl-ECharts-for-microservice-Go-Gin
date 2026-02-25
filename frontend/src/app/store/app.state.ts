import { StationsState, stationsReducer } from './stations/stations.reducer';
import { AlertsState, alertsReducer } from './alerts/alerts.reducer';
import { AqiState, aqiReducer } from './aqi/aqi.reducer';
import { AuthState, authReducer } from './auth/auth.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  stations: StationsState;
  alerts: AlertsState;
  aqi: AqiState;
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  stations: stationsReducer,
  alerts: alertsReducer,
  aqi: aqiReducer,
  auth: authReducer
};
