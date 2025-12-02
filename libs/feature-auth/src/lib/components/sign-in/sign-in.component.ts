import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@mini-crm/data-access';
import { ToastService } from '@mini-crm/shared-ui';
import type { LoginRequest } from '@mini-crm/data-access';

/**
 * Sign-in component for user authentication.
 *
 * Displays a full-screen centered Bootstrap card with a login form.
 * Validates email and password fields with Bootstrap validation styling.
 * Redirects to orders page on successful login.
 *
 * @usageNotes
 * ### Basic Usage
 * ```html
 * <lib-sign-in />
 * ```
 *
 * ### With Routing
 * Add to routes:
 * ```typescript
 * { path: 'auth/sign-in', component: SignInComponent }
 * ```
 *
 * @see SignUpComponent
 * @see AuthService
 * @category Feature Auth
 */
@Component({
  selector: 'lib-sign-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);


  constructor() {
    const token = this.authService.token();
    if (token) {
      this.router.navigate(['/orders']);
    }
  }

  /**
   * Loading state for form submission.
   */
  loading = signal(false);

  /**
   * Error message to display if login fails.
   */
  error = signal<string | null>(null);

  /**
   * Reactive form for sign-in.
   */
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  /**
   * Handles form submission.
   * Calls AuthService.signIn() and handles success/error.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    if (!formValue.email || !formValue.password) {
      this.loading.set(false);
      return;
    }

    const credentials: LoginRequest = {
      email: formValue.email,
      password: formValue.password,
    };

    this.authService.signIn(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        // Show success toast with welcome message
        this.toastService.showSuccess(
          `Bonjour, ${credentials.email} 😊`
        );
        // Redirect to orders page on successful login
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Email ou mot de passe incorrect');
          this.toastService.showError('Email ou mot de passe incorrect');
        } else {
          this.error.set('Une erreur est survenue lors de la connexion');
          this.toastService.showError('Une erreur est survenue lors de la connexion');
        }
      },
    });
  }

  /**
   * Checks if a form field has validation errors and has been touched.
   *
   * @param fieldName - Name of the form field
   * @returns True if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  /**
   * Gets the error message for a form field.
   *
   * @param fieldName - Name of the form field
   * @returns Error message or null
   */
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) {
      return null;
    }

    if (field.errors['required']) {
      return 'Ce champ est obligatoire';
    }

    if (field.errors['email']) {
      return 'Veuillez entrer une adresse email valide';
    }

    if (field.errors['minlength']) {
      return `Le mot de passe doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
    }

    return null;
  }
}

