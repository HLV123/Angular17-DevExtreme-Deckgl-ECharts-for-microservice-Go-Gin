import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { StationService } from '../../core/services/station.service';
import * as StationsActions from './stations.actions';

@Injectable()
export class StationsEffects {
    private actions$ = inject(Actions);
    private stationService = inject(StationService);

    loadStations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StationsActions.loadStations),
            exhaustMap(() =>
                this.stationService.getStations().pipe(
                    map(stations => StationsActions.loadStationsSuccess({ stations })),
                    catchError(error => of(StationsActions.loadStationsFailure({ error })))
                )
            )
        )
    );
}
