import { createReducer, on } from '@ngrx/store';
import { Station } from '../../core/models';
import * as StationsActions from './stations.actions';

export interface StationsState {
    stations: Station[];
    selectedStationId: string | null;
    loading: boolean;
    error: any;
}

export const initialState: StationsState = {
    stations: [],
    selectedStationId: null,
    loading: false,
    error: null
};

export const stationsReducer = createReducer(
    initialState,
    on(StationsActions.loadStations, state => ({ ...state, loading: true, error: null })),
    on(StationsActions.loadStationsSuccess, (state, { stations }) => ({
        ...state,
        stations,
        loading: false
    })),
    on(StationsActions.loadStationsFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(StationsActions.selectStation, (state, { stationId }) => ({
        ...state,
        selectedStationId: stationId
    }))
);
