import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideSpinnerConfig } from 'ngx-spinner';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './core/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideToastr(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideSpinnerConfig({
      type: 'ball-scale-multiple',
    }),
  ],
};
