import { CreateOrder, OrderDetail, UpdateOrder } from "@mini-crm/data-access";
import { createAction, props } from "@ngrx/store";


export const addOrder = createAction(
    '[Orders] Add Order',
    props<{ order: CreateOrder }>()
);

export const orderAdded = createAction(
    '[Orders] Order Added',
    props<{ order: OrderDetail }>()
);

export const updateOrder = createAction(
    '[Orders] Update Order',
    props<{ order: UpdateOrder }>()
);

export const orderUpdated = createAction(
    '[Orders] Order Updated',
    props<{ order: OrderDetail }>()
);

export const deleteOrder = createAction(
    '[Orders] Delete Order',
    props<{ id: number }>()
);

export const loadOrders = createAction(
    '[Orders] Load Orders'
);

export const ordersLoaded = createAction(
    '[Orders] Orders Loaded',
    props<{ orders: OrderDetail[] }>()
);

export const ordersError = createAction(
    '[Orders] Orders Error',
    props<{ error: string }>()
);