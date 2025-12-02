import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from './auth.service';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  describe('Initialisation', () => {
    it('devrait être créé', () => {
      expect(service).toBeTruthy();
    });

    it('devrait initialiser les signals avec des valeurs par défaut', () => {
      expect(service.token()).toBeNull();
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('devrait restaurer le token depuis sessionStorage si présent', () => {
      // Arrange
      const existingToken = 'existing-token-123';
      sessionStorage.setItem('authToken', existingToken);

      // Act - Créer un nouveau service pour tester la restauration
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      });
      const newService = TestBed.inject(AuthService);

      // Assert
      expect(newService.token()).toBe(existingToken);
    });

    it('ne devrait pas restaurer le token si sessionStorage est vide', () => {
      // Arrange
      sessionStorage.clear();

      // Act
      const newService = TestBed.inject(AuthService);

      // Assert
      expect(newService.token()).toBeNull();
    });
  });

  describe('signIn', () => {
    it('devrait authentifier un utilisateur avec succès', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token-123',
        user: { email: credentials.email },
      };

      // Act
      service.signIn(credentials).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockResponse);
          expect(service.token()).toBe(mockResponse.accessToken);
          expect(service.user()?.email).toBe(credentials.email);
          expect(service.isAuthenticated()).toBe(true);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('devrait sauvegarder le token dans sessionStorage après connexion', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token-456',
        user: { email: credentials.email },
      };

      // Act
      service.signIn(credentials).subscribe({
        next: () => {
          // Assert - Attendre que l'effect se déclenche
          setTimeout(() => {
            expect(sessionStorage.getItem('authToken')).toBe(mockResponse.accessToken);
            done();
          }, 50);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);
    });

    it('devrait mettre à jour le signal user avec l\'email', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'user@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token',
        user: { email: credentials.email },
      };

      // Act
      service.signIn(credentials).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);

      // Assert
      expect(service.user()?.email).toBe(credentials.email);
    });

    it('devrait gérer une erreur 401 (non autorisé)', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      // Act
      service.signIn(credentials).subscribe({
        next: () => {
          expect.fail('Should have failed');
        },
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(service.token()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('devrait gérer une erreur réseau', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      service.signIn(credentials).subscribe({
        next: () => {
          expect.fail('Should have failed');
        },
        error: (error) => {
          // Assert
          expect(error).toBeTruthy();
          expect(service.token()).toBeNull();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('signUp', () => {
    it('devrait créer un utilisateur et le connecter automatiquement', () => {
      // Arrange
      const credentials: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
      };
      const registerResponse: AuthResponse = {
        accessToken: 'register-token',
        user: { email: credentials.email },
      };
      const loginResponse: AuthResponse = {
        accessToken: 'login-token-456',
        user: { email: credentials.email },
      };

      // Act
      service.signUp(credentials).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(loginResponse);
          expect(service.token()).toBe(loginResponse.accessToken);
          expect(service.user()?.email).toBe(credentials.email);
          expect(service.isAuthenticated()).toBe(true);
        },
      });

      // Vérifier la requête d'inscription
      const registerReq = httpMock.expectOne('http://localhost:3000/register');
      expect(registerReq.request.method).toBe('POST');
      expect(registerReq.request.body).toEqual(credentials);
      registerReq.flush(registerResponse);

      // Vérifier la requête de connexion automatique
      const loginReq = httpMock.expectOne('http://localhost:3000/login');
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual(credentials);
      loginReq.flush(loginResponse);
    });

    it('devrait gérer une erreur 409 (email déjà utilisé)', () => {
      // Arrange
      const credentials: RegisterRequest = {
        email: 'existing@example.com',
        password: 'password123',
      };

      // Act
      service.signUp(credentials).subscribe({
        next: () => {
          expect.fail('Should have failed');
        },
        error: (error) => {
          // Assert
          expect(error.status).toBe(409);
          expect(service.token()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/register');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur et effacer les signals', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token',
        user: { email: credentials.email },
      };

      service.signIn(credentials).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);

      // Act
      service.logout();

      // Assert
      expect(service.token()).toBeNull();
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('devrait effacer le token de sessionStorage après déconnexion', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token-789',
        user: { email: credentials.email },
      };

      service.signIn(credentials).subscribe({
        next: () => {
          // Attendre que l'effect sauvegarde dans sessionStorage
          setTimeout(() => {
            expect(sessionStorage.getItem('authToken')).toBe(mockResponse.accessToken);

            // Act
            service.logout();

            // Assert
            setTimeout(() => {
              expect(sessionStorage.getItem('authToken')).toBeNull();
              done();
            }, 50);
          }, 50);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);
    });
  });

  describe('Computed Signals', () => {
    it('isAuthenticated devrait retourner true quand un token existe', () => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'mock-token',
        user: { email: credentials.email },
      };

      // Act
      service.signIn(credentials).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);

      // Assert
      expect(service.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated devrait retourner false quand aucun token', () => {
      // Assert
      expect(service.isAuthenticated()).toBe(false);
    });

    it('user devrait retourner null quand non authentifié', () => {
      // Assert
      expect(service.user()).toBeNull();
    });

    it('token devrait retourner null quand non authentifié', () => {
      // Assert
      expect(service.token()).toBeNull();
    });
  });

  describe('Session Storage Integration', () => {
    it('devrait synchroniser le token avec sessionStorage lors de la connexion', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'session-token-123',
        user: { email: credentials.email },
      };

      // Act
      service.signIn(credentials).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);

      // Assert - Attendre que l'effect se déclenche
      setTimeout(() => {
        expect(sessionStorage.getItem('authToken')).toBe(mockResponse.accessToken);
        done();
      }, 50);
    });

    it('devrait supprimer le token de sessionStorage lors de la déconnexion', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse: AuthResponse = {
        accessToken: 'session-token-456',
        user: { email: credentials.email },
      };

      service.signIn(credentials).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/login');
      req.flush(mockResponse);

      setTimeout(() => {
        expect(sessionStorage.getItem('authToken')).toBe(mockResponse.accessToken);

        // Act
        service.logout();

        // Assert
        setTimeout(() => {
          expect(sessionStorage.getItem('authToken')).toBeNull();
          done();
        }, 50);
      }, 50);
    });
  });
});

