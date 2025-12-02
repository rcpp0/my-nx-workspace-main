import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '@mini-crm/data-access';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ordersReducer, orderEffects } from '@mini-crm/feature-orders';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideStore({
      orders: ordersReducer,
    }),
    provideEffects(orderEffects),
    // Configuration API
    {
      provide: API_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl,
      },
    },
    // TODO Formation : provideHttpClient(withInterceptors([authInterceptor]))
  ],
};
