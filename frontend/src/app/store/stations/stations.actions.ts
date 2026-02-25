import { createAction, props } from '@ngrx/store';
import { Station } from '../../core/models';

export const loadStations = createAction('[Stations List] Load Stations');
export const loadStationsSuccess = createAction(
  '[Stations Effect] Load Stations Success',
  props<{ stations: Station[] }>()
);
export const loadStationsFailure = createAction(
  '[Stations Effect] Load Stations Failure',
  props<{ error: any }>()
);

export const selectStation = createAction(
  '[Stations List] Select Station',
  props<{ stationId: string }>()
);
