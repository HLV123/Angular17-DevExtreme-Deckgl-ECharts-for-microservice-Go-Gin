import { createAction, props } from '@ngrx/store';
import { User, LoginRequest } from '../../core/models';

export const login = createAction('[Auth] Login', props<LoginRequest>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User; token: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth] Logout');
export const loadProfile = createAction('[Auth] Load Profile');
export const loadProfileSuccess = createAction('[Auth] Load Profile Success', props<{ user: User }>());
