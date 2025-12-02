import { createReducer, on } from "@ngrx/store";
import { addOrder, updateOrder , deleteOrder, orderAdded, orderUpdated} from "./orders-actions";
import { OrdersState } from "./orders-state";


const initialState: OrdersState = {
    orders: [],
    loading: false,
    selectedOrder: null,
    error: null
};

export const ordersReducer = createReducer(
    initialState,

    on(orderAdded, (state, { order }) => {
        return { ...state, orders: [...state.orders, order], error: null, selectedOrder: null };
    }),

    on(orderUpdated, (state, { order }) => {
        return { 
            ...state, 
            selectedOrder: null, 
            orders: [...state.orders.filter(o => o.id !== order.id), order], 
            error: null };
    }),

    on(deleteOrder, (state, { id }) => {
        return { ...state, orders: state.orders.filter(o => o.id !== id) };
    })
);
