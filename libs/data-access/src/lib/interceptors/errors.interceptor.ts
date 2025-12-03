import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP interceptor to handle errors and provide human-readable error messages.
 *
 * Intercepts HTTP errors and generates user-friendly error messages
 * based on the HTTP status code. Re-throws the error with the humanized message.
 *
 * @usageNotes
 * ### Registration in app.config.ts
 * ```typescript
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { errorsInterceptor } from '@mini-crm/data-access';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([errorsInterceptor])),
 *   ],
 * };
 * ```
 *
 * ### Error Messages by Status Code
 * - **400**: "Requête invalide. Veuillez vérifier les données saisies."
 * - **401**: "Vous n'êtes pas authentifié. Veuillez vous connecter."
 * - **403**: "Vous n'avez pas les permissions nécessaires pour cette action."
 * - **404**: "Ressource non trouvée."
 * - **500**: "Erreur serveur. Veuillez réessayer plus tard."
 * - **0**: "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
 *
 * ### How It Works
 * 1. Intercepts HTTP errors using `catchError`
 * 2. Generates human-readable message based on status code
 * 3. Re-throws error with humanized message in `error.message`
 *
 * @category Data Access
 */
export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const humanizedMessage = getHumanizedErrorMessage(error);
      
      // Add humanized message to the error object
      // This allows components to access it via error.message or error.humanizedMessage
      const errorWithMessage = {
        ...error,
        message: humanizedMessage,
        humanizedMessage: humanizedMessage,
      } as HttpErrorResponse & { humanizedMessage: string };

      return throwError(() => errorWithMessage);
    })
  );
};

/**
 * Generates a human-readable error message based on HTTP status code.
 *
 * @param error - HTTP error response
 * @returns Human-readable error message in French
 * @internal
 */
function getHumanizedErrorMessage(error: HttpErrorResponse): string {
  // Network error (status 0)
  if (error.status === 0) {
    return "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
  }

  // Handle specific status codes
  switch (error.status) {
    case 400:
      return "Requête invalide. Veuillez vérifier les données saisies.";
    
    case 401:
      return "Vous n'êtes pas authentifié. Veuillez vous connecter.";
    
    case 403:
      return "Vous n'avez pas les permissions nécessaires pour cette action.";
    
    case 404:
      return "Ressource non trouvée.";
    
    case 500:
    case 502:
    case 503:
    case 504:
      return "Erreur serveur. Veuillez réessayer plus tard.";
    
    default:
      // Try to use server error message if available
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.message) {
        return error.message;
      }
      return `Une erreur est survenue (${error.status || 'inconnue'}).`;
  }
}

