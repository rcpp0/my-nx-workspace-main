import { createSelector } from "@ngrx/store";
import { OrdersState } from "./orders-state";



export const selectOrders = createSelector(
    (state: OrdersState) => state.orders,
    (orders) => orders
);


export const selectOrderLoading = createSelector(
    (state: OrdersState) => state.loading,
    (loading) => loading
);

export const selectOrderError = createSelector(
    (state: OrdersState) => state.error,
    (error) => error
);

export const selectSelectedOrder = createSelector(
    (state: OrdersState) => state.selectedOrder,
    (selectedOrder) => selectedOrder
);