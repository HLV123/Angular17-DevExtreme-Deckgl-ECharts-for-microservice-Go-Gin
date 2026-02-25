import { createSelector, createFeatureSelector } from '@ngrx/store';
import { StationsState } from './stations.reducer';

export const selectStationsState = createFeatureSelector<StationsState>('stations');

export const selectAllStations = createSelector(
    selectStationsState,
    (state: StationsState) => state.stations
);

export const selectStationsLoading = createSelector(
    selectStationsState,
    (state: StationsState) => state.loading
);

export const selectStationsError = createSelector(
    selectStationsState,
    (state: StationsState) => state.error
);

export const selectSelectedStationId = createSelector(
    selectStationsState,
    (state: StationsState) => state.selectedStationId
);

export const selectSelectedStation = createSelector(
    selectAllStations,
    selectSelectedStationId,
    (stations, selectedId) => selectedId ? stations.find(s => s.id === selectedId) : null
);
