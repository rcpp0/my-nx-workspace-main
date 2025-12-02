import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../models/auth.model';

/**
 * Service for managing user authentication and session state.
 *
 * Handles user login, registration, and logout operations using json-server-auth.
 * Manages authentication state with signals and automatically persists the token
 * in sessionStorage. Provides computed signals for token, user, and authentication status.
 *
 * @usageNotes
 * ### Injecting the Service
 * ```typescript
 * private readonly authService = inject(AuthService);
 * ```
 *
 * ### Checking Authentication Status
 * ```typescript
 * if (this.authService.isAuthenticated()) {
 *   // User is authenticated
 *   const token = this.authService.token();
 *   const user = this.authService.user();
 * }
 * ```
 *
 * ### Sign In
 * ```typescript
 * const credentials: LoginRequest = {
 *   email: 'user@example.com',
 *   password: 'password123'
 * };
 *
 * this.authService.signIn(credentials).subscribe({
 *   next: (response) => {
 *     // Token and user are automatically updated
 *     console.log('Logged in:', this.authService.user());
 *   },
 *   error: (err) => console.error('Login failed:', err)
 * });
 * ```
 *
 * ### Sign Up
 * ```typescript
 * const credentials: RegisterRequest = {
 *   email: 'newuser@example.com',
 *   password: 'password123'
 * };
 *
 * this.authService.signUp(credentials).subscribe({
 *   next: (response) => {
 *     // User is automatically logged in after registration
 *     console.log('Registered and logged in:', this.authService.user());
 *   }
 * });
 * ```
 *
 * ### Logout
 * ```typescript
 * this.authService.logout();
 * // Token and user are cleared, sessionStorage is updated
 * ```
 *
 * @see User
 * @see LoginRequest
 * @see RegisterRequest
 * @see AuthResponse
 * @category Data Access
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Private writable signal for authentication token.
   * @internal
   */
  private readonly tokenSignal = signal<string | null>(null);

  /**
   * Private writable signal for authenticated user data.
   * @internal
   */
  private readonly userSignal = signal<User | null>(null);

  /**
   * HTTP client for API requests.
   * @internal
   */
  private readonly http = inject(HttpClient);

  /**
   * Current authentication token.
   *
   * Returns the JWT token if user is authenticated, null otherwise.
   * Automatically synced with sessionStorage.
   *
   * @readonly
   * @returns Current token or null
   *
   * @example
   * ```typescript
   * const token = this.authService.token();
   * if (token) {
   *   // Use token for authenticated requests
   * }
   * ```
   */
  readonly token = computed(() => this.tokenSignal());

  /**
   * Current authenticated user data.
   *
   * Returns the user object if authenticated, null otherwise.
   *
   * @readonly
   * @returns Current user or null
   *
   * @example
   * ```typescript
   * const user = this.authService.user();
   * if (user) {
   *   console.log('Logged in as:', user.email);
   * }
   * ```
   */
  readonly user = computed(() => this.userSignal());

  /**
   * Authentication status.
   *
   * Returns true if user is authenticated (has a valid token), false otherwise.
   *
   * @readonly
   * @computed
   * @returns True if authenticated, false otherwise
   *
   * @example
   * ```typescript
   * if (this.authService.isAuthenticated()) {
   *   // Show protected content
   * }
   * ```
   */
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  /**
   * Initializes the service and restores token from sessionStorage if available.
   *
   * Checks for an existing token in sessionStorage and restores it if found.
   * This allows the user to remain authenticated across page refreshes.
   */
  constructor() {
    const existingToken = sessionStorage.getItem('authToken');
    if (existingToken) {
      console.log(`existingToken: ${existingToken}`);
      this.tokenSignal.set(existingToken);
    } else {
      console.log('no existing token');
    }
  }

  /**
   * Effect that automatically syncs token with sessionStorage.
   *
   * Saves token to sessionStorage when it changes, or removes it when token is cleared.
   * This ensures the token persists across page refreshes.
   *
   * @internal
   */
  private readonly storeInSessionStorageEffect = effect(() => {
    const token = this.token();
    if (token) {
      sessionStorage.setItem('authToken', token);
    } else {
      sessionStorage.removeItem('authToken');
    }
  });

  /**
   * Authenticates a user with email and password.
   *
   * Sends a POST request to the login endpoint and updates the token and user signals
   * on success. The token is automatically saved to sessionStorage via the effect.
   *
   * @param credentials - User login credentials (email and password)
   * @returns Observable that emits AuthResponse on success
   * @throws {HttpErrorResponse} When authentication fails (401, 500, etc.)
   *
   * @example
   * ```typescript
   * const credentials: LoginRequest = {
   *   email: 'user@example.com',
   *   password: 'password123'
   * };
   *
   * this.authService.signIn(credentials).subscribe({
   *   next: (response) => {
   *     // Token and user are automatically updated
   *     const user = this.authService.user();
   *     console.log('Logged in as:', user?.email);
   *   },
   *   error: (err) => {
   *     if (err.status === 401) {
   *       console.error('Invalid credentials');
   *     }
   *   }
   * });
   * ```
   */
  signIn(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:3000/login', credentials).pipe(
      tap((response) => {
        console.log(`signIn: ${response.accessToken}`);
        this.tokenSignal.set(response.accessToken);
        this.userSignal.set({ email: credentials.email });
      })
    );
  }

  /**
   * Registers a new user and automatically signs them in.
   *
   * First creates a new user account via POST to /register, then automatically
   * calls signIn() to authenticate the newly created user. Returns the sign-in response.
   *
   * @param credentials - User registration credentials (email and password)
   * @returns Observable that emits AuthResponse from the sign-in operation
   * @throws {HttpErrorResponse} When registration fails (400, 409, 500, etc.)
   *
   * @example
   * ```typescript
   * const credentials: RegisterRequest = {
   *   email: 'newuser@example.com',
   *   password: 'password123'
   * };
   *
   * this.authService.signUp(credentials).subscribe({
   *   next: (response) => {
   *     // User is automatically logged in
   *     console.log('Registered and logged in:', this.authService.user());
   *   },
   *   error: (err) => {
   *     if (err.status === 409) {
   *       console.error('Email already exists');
   *     }
   *   }
   * });
   * ```
   */
  signUp(credentials: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('http://localhost:3000/register', credentials)
      .pipe(switchMap(() => this.signIn(credentials)));
  }

  /**
   * Logs out the current user.
   *
   * Clears the token and user signals, which automatically removes the token
   * from sessionStorage via the effect. After logout, isAuthenticated() returns false.
   *
   * @example
   * ```typescript
   * this.authService.logout();
   * // User is now logged out, token cleared from sessionStorage
   * ```
   */
  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}

