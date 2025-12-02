// TODO Formation : Décommenter les imports suivants
// import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
// import { Router } from '@angular/router';
import { AuthService } from '@mini-crm/data-access';

/**
 * Authentication guard to protect routes.
 *
 * **Note**: Currently returns `true` to allow development.
 * Will be implemented in training to check authentication status.
 *
 * @usageNotes
 * ### Basic Usage
 * ```typescript
 * export const routes: Routes = [
 *   {
 *     path: 'orders',
 *     canActivate: [authGuard],
 *     component: OrdersComponent
 *   }
 * ];
 * ```
 *
 * ### Implementation for Training
 * Uncomment the code below and remove the `return true;` statement:
 * ```typescript
 * const authService = inject(AuthService);
 * const router = inject(Router);
 *
 * if (authService.isAuthenticated()) {
 *   return true;
 * }
 *
 * return router.createUrlTree(['/auth/sign-in'], {
 *   queryParams: { returnUrl: state.url }
 * });
 * ```
 *
 * @see AuthService
 * @category Security
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (_route, _state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  // TODO Formation : Implémenter la vérification d'authentification
  // Pour l'instant, le guard laisse passer toutes les routes pour le développement

  // Code commenté pour la formation :
  // const authService = inject(AuthService);
  // const router = inject(Router);
  //
  // if (authService.isAuthenticated()) {
  //   return true;
  // }
  //
  // // Rediriger vers la page de connexion avec l'URL de retour
  // return router.createUrlTree(['/auth/sign-in'], {
  //   queryParams: { returnUrl: state.url }
  // });

  if (authService.isAuthenticated()) {
    return true;
  } else {
    return router.createUrlTree(['/auth/sign-in']);
  }
};

