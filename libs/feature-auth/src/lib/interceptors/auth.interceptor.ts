import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '@mini-crm/data-access';

/**
 * HTTP interceptor to add Bearer token to authenticated requests.
 *
 * Automatically adds the Authorization header with Bearer token
 * if a token is present in AuthService.
 *
 * **Note**: This interceptor is functional but not registered yet.
 * Will be registered in app.config.ts during training.
 *
 * @usageNotes
 * ### Registration in app.config.ts
 * ```typescript
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { authInterceptor } from '@mini-crm/feature-auth';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor])),
 *   ],
 * };
 * ```
 *
 * ### How It Works
 * 1. Checks if AuthService has a token
 * 2. If token exists, clones the request and adds `Authorization: Bearer <token>` header
 * 3. If no token, passes the request through unchanged
 *
 * @see AuthService
 * @category Security
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  // Add Bearer token to request if available
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};



