import { signalStore, withState, withMethods } from '@ngrx/signals';
import { OrdersState } from './orders-state';
import { inject, InjectionToken } from '@angular/core';
import { OrdersService } from '@mini-crm/data-access';
import { rxMethod} from '@ngrx/signals/rxjs-interop';
import { pipe ,tap, exhaustMap} from 'rxjs';
import { patchState} from '@ngrx/signals';
import {tapResponse} from '@ngrx/operators';
import { OrderDetail } from '@mini-crm/data-access';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: OrdersState = {
    orders: [],
    loading: false,
    error: null,
    selectedOrder: null
}

const ORDER_STATE = new InjectionToken<OrdersState>('ORDER_STATE', {factory: () => initialState});

export const ordersSignalStore = signalStore(
    withState(() => inject(ORDER_STATE)),
    withMethods((store, orderService = inject(OrdersService)) => ({
        loadOrders: rxMethod(
            pipe(
                tap(() => patchState(store, { loading: true })),
                exhaustMap(() => orderService.getAll()),
                tapResponse({
                    next: (orders: OrderDetail[]) => patchState(store, { orders }),
                    error: (error: HttpErrorResponse) => patchState(store, { error: error.message }),
                    complete: () => patchState(store, { loading: false })
                })
            ))
        }
    ))
)