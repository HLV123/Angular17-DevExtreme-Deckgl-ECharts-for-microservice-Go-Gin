import { createAction, props } from '@ngrx/store';
import { AqiReading } from '../../core/models';

export const loadCurrentAqi = createAction('[AQI] Load Current');
export const loadCurrentAqiSuccess = createAction('[AQI] Load Success', props<{ readings: AqiReading[] }>());
export const loadCurrentAqiFailure = createAction('[AQI] Load Failure', props<{ error: string }>());
export const updateAqiRealtime = createAction('[AQI] Realtime Update', props<{ reading: AqiReading }>());
