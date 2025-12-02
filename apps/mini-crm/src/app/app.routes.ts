import { Route } from '@angular/router';
import { authGuard } from '@mini-crm/feature-auth';

/**
 * Routes principales de l'application
 *
 * Configuration avec lazy loading des features pour optimiser le bundle initial.
 *
 * @category Routing
 */
export const appRoutes: Route[] = [
  // Redirection par défaut vers la page de connexion
  {
    path: '',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full',
  },

  // Routes d'authentification (publiques)
  {
    path: 'auth',
    loadChildren: () =>
      import('@mini-crm/feature-auth').then((m) => m.AUTH_ROUTES),
  },

  // Routes des commandes (protégées par authGuard)
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@mini-crm/feature-orders').then((m) => m.ORDERS_ROUTES),
  },

  // Route 404 (optionnel, à implémenter plus tard)
  // {
  //   path: '**',
  //   redirectTo: 'auth/sign-in',
  // },
];
