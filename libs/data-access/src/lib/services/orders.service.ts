import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import type { OrderDetail, CreateOrder, UpdateOrder } from '../models/order.model';

/**
 * Service for managing orders data and operations.
 *
 * Handles all HTTP requests related to orders including CRUD operations.
 * Automatically calculates totalHt and totalTtc before sending to the API.
 * Refreshes the orders list after create, update, or delete operations.
 *
 * @usageNotes
 * ### Injecting the Service
 * ```typescript
 * private readonly ordersService = inject(OrdersService);
 * ```
 *
 * ### Loading Orders
 * ```typescript
 * this.ordersService.getAll().subscribe({
 *   next: () => {
 *     // Orders are automatically updated in ordersService.orders()
 *     const orders = this.ordersService.orders();
 *   },
 *   error: (err) => console.error('Failed to load orders:', err)
 * });
 * ```
 *
 * ### Creating an Order
 * ```typescript
 * const newOrder: CreateOrder = {
 *   customer: 'Acme Corp',
 *   nbDays: 5,
 *   tjm: 650,
 *   tauxTva: 20
 * };
 *
 * this.ordersService.create(newOrder).subscribe({
 *   next: () => {
 *     // Orders list is automatically refreshed
 *   }
 * });
 * ```
 *
 * @see OrderDetail
 * @see CreateOrder
 * @see UpdateOrder
 * @category Data Access
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly apiUrl = `${this.config.apiUrl}/orders`;

  // Private writable signals
  #orders = signal<OrderDetail[]>([]);
  #loading = signal<boolean>(false);
  #error = signal<string | null>(null);

  // Public readonly signals
  /**
   * List of all orders.
   * @readonly
   */
  orders = this.#orders.asReadonly();

  /**
   * Loading state for operations.
   * @readonly
   */
  loading = this.#loading.asReadonly();

  /**
   * Error message if an operation fails.
   * @readonly
   */
  error = this.#error.asReadonly();

  /**
   * Retrieves all orders from the API.
   *
   * Updates the orders signal with the fetched data.
   *
   * @returns Observable that completes when orders are loaded
   *
   * @example
   * ```typescript
   * this.ordersService.getAll().subscribe({
   *   next: () => {
   *     const orders = this.ordersService.orders();
   *     console.log(`Loaded ${orders.length} orders`);
   *   }
   * });
   * ```
   */
  getAll(): Observable<OrderDetail[]> {
    this.#loading.set(true);
    this.#error.set(null);

    return this.http.get<OrderDetail[]>(this.apiUrl).pipe(
      tap((orders) => {
        this.#orders.set(orders);
        this.#loading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.#loading.set(false);
        this.#error.set(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Retrieves an order by its ID.
   *
   * Returns the order from the local orders signal if available,
   * otherwise fetches from the API.
   *
   * @param id - Order ID
   * @returns Observable of the order
   *
   * @example
   * ```typescript
   * this.ordersService.getById(1).subscribe({
   *   next: (order) => console.log('Order:', order)
   * });
   * ```
   */
  getById(id: number): Observable<OrderDetail> {
    // Try to get from local signal first
    const localOrder = this.#orders().find((o) => o.id === id);
    if (localOrder) {
      return new Observable((subscriber) => {
        subscriber.next(localOrder);
        subscriber.complete();
      });
    }

    // Otherwise fetch from API
    this.#loading.set(true);
    this.#error.set(null);

    return this.http.get<OrderDetail>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.#loading.set(false);
        this.#error.set(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Creates a new order.
   *
   * Calculates totalHt and totalTtc before sending to the API.
   * Automatically refreshes the orders list after successful creation.
   *
   * @param orderData - Order data without id and totals
   * @returns Observable of the created order
   *
   * @example
   * ```typescript
   * const newOrder: CreateOrder = {
   *   customer: 'Acme Corp',
   *   nbDays: 5,
   *   tjm: 650,
   *   tauxTva: 20
   * };
   *
   * this.ordersService.create(newOrder).subscribe({
   *   next: (order) => {
   *     // Orders list is automatically refreshed
   *     console.log('Created order:', order);
   *   }
   * });
   * ```
   */
  create(orderData: CreateOrder): Observable<OrderDetail> {
    this.#loading.set(true);
    this.#error.set(null);

    // Calculate totals before sending
    const totalHt = orderData.nbDays * orderData.tjm;
    const totalTtc = totalHt * (1 + orderData.tauxTva / 100);

    const orderPayload: Omit<OrderDetail, 'id'> = {
      ...orderData,
      totalHt,
      totalTtc,
    };

    return this.http.post<OrderDetail>(this.apiUrl, orderPayload).pipe(
      tap(() => {
        // Refresh orders list after successful creation
        this.refresh();
      }),
      catchError((error: HttpErrorResponse) => {
        this.#loading.set(false);
        this.#error.set(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates an existing order.
   *
   * Calculates totalHt and totalTtc before sending to the API.
   * Automatically refreshes the orders list after successful update.
   *
   * @param orderData - Order data with id, without totals
   * @returns Observable of the updated order
   *
   * @example
   * ```typescript
   * const updatedOrder: UpdateOrder = {
   *   id: 1,
   *   customer: 'Updated Corp',
   *   nbDays: 10,
   *   tjm: 700,
   *   tauxTva: 20
   * };
   *
   * this.ordersService.update(updatedOrder).subscribe({
   *   next: (order) => {
   *     // Orders list is automatically refreshed
   *     console.log('Updated order:', order);
   *   }
   * });
   * ```
   */
  update(orderData: UpdateOrder): Observable<OrderDetail> {
    this.#loading.set(true);
    this.#error.set(null);

    // Calculate totals before sending
    const totalHt = orderData.nbDays * orderData.tjm;
    const totalTtc = totalHt * (1 + orderData.tauxTva / 100);

    const orderPayload: OrderDetail = {
      ...orderData,
      totalHt,
      totalTtc,
    };

    return this.http.put<OrderDetail>(`${this.apiUrl}/${orderData.id}`, orderPayload).pipe(
      tap(() => {
        // Refresh orders list after successful update
        this.refresh();
      }),
      catchError((error: HttpErrorResponse) => {
        this.#loading.set(false);
        this.#error.set(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Deletes an order by its ID.
   *
   * Automatically refreshes the orders list after successful deletion.
   *
   * @param id - Order ID to delete
   * @returns Observable that completes when deletion is successful
   *
   * @example
   * ```typescript
   * this.ordersService.delete(1).subscribe({
   *   next: () => {
   *     // Orders list is automatically refreshed
   *     console.log('Order deleted');
   *   }
   * });
   * ```
   */
  delete(id: number): Observable<void> {
    this.#loading.set(true);
    this.#error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Refresh orders list after successful deletion
        this.refresh();
      }),
      catchError((error: HttpErrorResponse) => {
        this.#loading.set(false);
        this.#error.set(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Refreshes the orders list by calling getAll().
   *
   * Updates the orders signal with the latest data from the API.
   * Called automatically after create, update, or delete operations.
   *
   * @internal
   */
  private refresh(): void {
    this.getAll().subscribe({
      next: (orders) => {
        this.#orders.set(orders);
        this.#loading.set(false);
      },
      error: () => {
        // Error already handled in getAll()
        this.#loading.set(false);
      },
    });
  }

  /**
   * Gets a user-friendly error message from an HttpErrorResponse.
   *
   * @param error - HTTP error response
   * @returns Error message string
   * @internal
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Erreur réseau : ${error.error.message}`;
    }

    switch (error.status) {
      case 404:
        return 'Commande non trouvée';
      case 400:
        return 'Données invalides';
      case 500:
        return 'Erreur serveur';
      default:
        return `Erreur ${error.status} : ${error.message}`;
    }
  }
}

