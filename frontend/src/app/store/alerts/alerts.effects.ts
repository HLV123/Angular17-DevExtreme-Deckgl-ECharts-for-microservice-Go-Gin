import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AlertService } from '../../core/services/alert.service';
import * as AlertActions from './alerts.actions';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AlertsEffects {
  loadAlerts$ = createEffect(() => this.actions$.pipe(
    ofType(AlertActions.loadAlerts),
    mergeMap(() => this.alertService.getAlerts().pipe(
      map(alerts => AlertActions.loadAlertsSuccess({ alerts })),
      catchError(error => of(AlertActions.loadAlertsFailure({ error: error.message })))
    ))
  ));
  constructor(private actions$: Actions, private alertService: AlertService) {}
}
