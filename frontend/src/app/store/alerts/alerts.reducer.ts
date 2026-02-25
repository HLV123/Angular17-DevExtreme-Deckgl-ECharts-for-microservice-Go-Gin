import { createReducer, on } from '@ngrx/store';
import { Alert } from '../../core/models';
import * as AlertActions from './alerts.actions';

export interface AlertsState { alerts: Alert[]; loading: boolean; error: string | null; }
export const initialState: AlertsState = { alerts: [], loading: false, error: null };

export const alertsReducer = createReducer(initialState,
  on(AlertActions.loadAlerts, state => ({ ...state, loading: true })),
  on(AlertActions.loadAlertsSuccess, (state, { alerts }) => ({ ...state, alerts, loading: false, error: null })),
  on(AlertActions.loadAlertsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AlertActions.acknowledgeAlert, (state, { id }) => ({
    ...state, alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' as any } : a)
  })),
  on(AlertActions.closeAlert, (state, { id }) => ({
    ...state, alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'closed' as any } : a)
  })),
  on(AlertActions.updateAlertRealtime, (state, { alert }) => ({
    ...state, alerts: [alert, ...state.alerts.filter(a => a.id !== alert.id)]
  }))
);
