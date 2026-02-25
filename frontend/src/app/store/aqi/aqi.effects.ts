import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AqiService } from '../../core/services/aqi.service';
import * as AqiActions from './aqi.actions';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AqiEffects {
  loadCurrentAqi$ = createEffect(() => this.actions$.pipe(
    ofType(AqiActions.loadCurrentAqi),
    mergeMap(() => this.aqiService.getCurrentAqi().pipe(
      map(readings => AqiActions.loadCurrentAqiSuccess({ readings })),
      catchError(error => of(AqiActions.loadCurrentAqiFailure({ error: error.message })))
    ))
  ));
  constructor(private actions$: Actions, private aqiService: AqiService) {}
}
