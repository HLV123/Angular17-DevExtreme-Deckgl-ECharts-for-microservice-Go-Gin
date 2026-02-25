import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/auth/auth.service';
import * as AuthActions from './auth.actions';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap(({ email, password }) => this.authService.login({ email, password }).pipe(
      map(resp => AuthActions.loginSuccess({ user: resp.user, token: resp.accessToken })),
      catchError(error => of(AuthActions.loginFailure({ error: error.message })))
    ))
  ));
  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(() => this.router.navigate(['/dashboard']))
  ), { dispatch: false });
  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => { this.authService.logout(); this.router.navigate(['/login']); })
  ), { dispatch: false });
  constructor(private actions$: Actions, private authService: AuthService, private router: Router) {}
}
