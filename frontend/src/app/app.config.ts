import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { MockInterceptor } from './core/interceptors/mock.interceptor';
import { reducers } from './store/app.state';
import { StationsEffects } from './store/stations/stations.effects';
import { AlertsEffects } from './store/alerts/alerts.effects';
import { AqiEffects } from './store/aqi/aqi.effects';
import { AuthEffects } from './store/auth/auth.effects';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: MockInterceptor, multi: true },
    provideAnimations(),
    provideStore(reducers),
    provideEffects(StationsEffects, AlertsEffects, AqiEffects, AuthEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideTranslateService({ defaultLanguage: 'vi' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' })
  ]
};
