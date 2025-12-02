import { inject } from '@angular/core';
import { OrdersService } from '@mini-crm/data-access';
import { switchMap, map, tap, catchError, of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  addOrder,
  loadOrders,
  orderAdded,
  ordersLoaded,
  updateOrder,
  orderUpdated,
  ordersError,
} from './orders-actions';

/**
 * Effect to load all orders from the API.
 *
 * @category Store
 */
const loadOrdersEffect = createEffect(
  (actions$ = inject(Actions), ordersService = inject(OrdersService)) => {
    return actions$.pipe(
      ofType(loadOrders),
      switchMap(() =>
        ordersService.getAll().pipe(
          tap((orders) => console.log(`Loaded orders:`, orders)),
          map((orders) => ordersLoaded({ orders })),
          catchError((error) =>
            of(
              ordersError({
                error: error.message || 'Failed to load orders',
              })
            )
          )
        )
      )
    );
  },
  { functional: true }
);

/**
 * Effect to add a new order.
 *
 * @category Store
 */
const addOrderEffect = createEffect(
  (actions$ = inject(Actions), ordersService = inject(OrdersService)) => {
    return actions$.pipe(
      ofType(addOrder),
      switchMap(({ order }) =>
        ordersService.create(order).pipe(
          map((order) => orderAdded({ order })),
          catchError((error) =>
            of(
              ordersError({
                error: error.message || 'Failed to add order',
              })
            )
          )
        )
      )
    );
  },
  { functional: true }
);

/**
 * Effect to update an existing order.
 *
 * @category Store
 */
const updateOrderEffect = createEffect(
  (actions$ = inject(Actions), ordersService = inject(OrdersService)) => {
    return actions$.pipe(
      ofType(updateOrder),
      switchMap(({ order }) =>
        ordersService.update(order).pipe(
          map((order) => orderUpdated({ order })),
          catchError((error) =>
            of(
              ordersError({
                error: error.message || 'Failed to update order',
              })
            )
          )
        )
      )
    );
  },
  { functional: true }
);

export const orderEffects = {
    loadOrdersEffect: loadOrdersEffect,
    addOrderEffect: addOrderEffect,
    updateOrderEffect: updateOrderEffect
}