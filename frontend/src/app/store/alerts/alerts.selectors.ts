import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AlertsState } from './alerts.reducer';

export const selectAlertsState = createFeatureSelector<AlertsState>('alerts');
export const selectAllAlerts = createSelector(selectAlertsState, s => s.alerts);
export const selectAlertsLoading = createSelector(selectAlertsState, s => s.loading);
export const selectActiveAlerts = createSelector(selectAllAlerts, alerts => alerts.filter(a => a.status !== 'closed'));
export const selectAlertsByLevel = (level: string) => createSelector(selectAllAlerts, alerts => alerts.filter(a => a.level === level));
export const selectAlertCount = createSelector(selectAllAlerts, a => ({
  total: a.length, emergency: a.filter(x => x.level === 'emergency').length,
  critical: a.filter(x => x.level === 'critical').length, warning: a.filter(x => x.level === 'warning').length
}));
