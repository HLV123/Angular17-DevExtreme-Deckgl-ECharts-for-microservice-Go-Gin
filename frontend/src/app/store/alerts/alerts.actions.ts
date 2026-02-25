import { createAction, props } from '@ngrx/store';
import { Alert } from '../../core/models';

export const loadAlerts = createAction('[Alerts] Load');
export const loadAlertsSuccess = createAction('[Alerts] Load Success', props<{ alerts: Alert[] }>());
export const loadAlertsFailure = createAction('[Alerts] Load Failure', props<{ error: string }>());
export const acknowledgeAlert = createAction('[Alerts] Acknowledge', props<{ id: string }>());
export const closeAlert = createAction('[Alerts] Close', props<{ id: string; reason: string }>());
export const updateAlertRealtime = createAction('[Alerts] Realtime Update', props<{ alert: Alert }>());
