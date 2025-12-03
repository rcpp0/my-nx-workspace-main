import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { OrdersState } from './orders-state';
import { computed, inject, InjectionToken } from '@angular/core';
import { OrdersService } from '@mini-crm/data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, exhaustMap, switchMap, of, EMPTY } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import type {
  OrderDetail,
  CreateOrder,
  UpdateOrder,
} from '@mini-crm/data-access';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

const ORDER_STATE = new InjectionToken<OrdersState>('ORDER_STATE', {
  factory: () => initialState,
});

export const ordersSignalStore = signalStore(
  withState(() => inject(ORDER_STATE)),
  withComputed((store) => ({
    orders: computed(() => store.orders()),
    loading: computed(() => store.loading()),
    error: computed(() => store.error()),
    selectedOrder: computed(() => store.selectedOrder()),
  })),
  withMethods((store, orderService = inject(OrdersService)) => ({
    loadOrders: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true, error: null });
          return orderService.getAll();
        }),
        tapResponse({
          next: (orders: OrderDetail[]) =>
            patchState(store, { orders, loading: false, error: null }),
          error: (error: HttpErrorResponse) =>
            patchState(store, {
              loading: false,
              error: error.message || 'Erreur lors du chargement des commandes',
            }),
        })
      )
    ),

    addOrder: rxMethod<CreateOrder>(
      pipe(
        exhaustMap((orderData: CreateOrder) => {
          patchState(store, { loading: true, error: null });
          return orderService.create(orderData);
        }),
        tapResponse({
          next: (newOrder: OrderDetail) => {
            patchState(store, {
              orders: [...store.orders(), newOrder],
              loading: false,
              error: null,
            });
          },
          error: (error: HttpErrorResponse) =>
            patchState(store, {
              loading: false,
              error: error.message || 'Erreur lors de la création de la commande',
            }),
        })
      )
    ),

    updateOrder: rxMethod<UpdateOrder>(
      pipe(
        exhaustMap((orderData: UpdateOrder) => {
          patchState(store, { loading: true, error: null });
          return orderService.update(orderData);
        }),
        tapResponse({
          next: (updatedOrder: OrderDetail) => {
            patchState(store, {
              orders: store.orders().map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order
              ),
              selectedOrder: null,
              loading: false,
              error: null,
            });
          },
          error: (error: HttpErrorResponse) =>
            patchState(store, {
              loading: false,
              error: error.message || 'Erreur lors de la mise à jour de la commande',
            }),
        })
      )
    ),

    deleteOrder: rxMethod<number>(
      pipe(
        exhaustMap((id: number) => {
          patchState(store, { loading: true, error: null });
          return orderService.delete(id).pipe(
            switchMap(() => {
              // After successful deletion, update state
              patchState(store, {
                orders: store.orders().filter((order) => order.id !== id),
                selectedOrder: null,
                loading: false,
                error: null,
              });
              return of(null);
            })
          );
        }),
        tapResponse({
          next: () => {
            // State already updated in switchMap
          },
          error: (error: HttpErrorResponse) =>
            patchState(store, {
              loading: false,
              error: error.message || 'Erreur lors de la suppression de la commande',
            }),
        })
      )
    ),

    selectOrder: rxMethod<number>(
      pipe(
        exhaustMap((id: number) => {
          // Try to find order in current list first
          const existingOrder = store.orders().find((order) => order.id === id);
          if (existingOrder) {
            patchState(store, { selectedOrder: existingOrder });
            return EMPTY;
          }

          // Otherwise fetch from API
          patchState(store, { loading: true, error: null });
          return orderService.getById(id);
        }),
        tapResponse({
          next: (order: OrderDetail) => {
            patchState(store, {
              selectedOrder: order,
              loading: false,
              error: null,
            });
          },
          error: (error: HttpErrorResponse) =>
            patchState(store, {
              loading: false,
              selectedOrder: null,
              error: error.message || 'Commande non trouvée',
            }),
        })
      )
    ),
  }))
);
