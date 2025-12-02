import { Injectable, signal, computed } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { effect, inject } from '@angular/core';
import { switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<User | null>(null);

  private readonly http = inject(HttpClient);

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());


  constructor() {
    const existingToken = sessionStorage.getItem('authToken');
    if (existingToken) {
      console.log(`existingToken: ${existingToken}`);
      this.tokenSignal.set(existingToken);
    } else {
      console.log('no existing token');
    }
  }

  private readonly storeInSessionStorageEffect = effect(() => {
    const token = this.token();
    if (token) {
      sessionStorage.setItem('authToken', token);
    } else {
      sessionStorage.removeItem('authToken');
    }
  })

  signIn(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:3000/login', credentials)
    .pipe(tap(response => {
      console.log(`signIn: ${response.accessToken}`);
      this.tokenSignal.set(response.accessToken);
      this.userSignal.set({ email: credentials.email });
    }))
     
  }

  signUp(credentials: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:3000/register', credentials)
    .pipe(switchMap(() => this.signIn(credentials)))
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}

