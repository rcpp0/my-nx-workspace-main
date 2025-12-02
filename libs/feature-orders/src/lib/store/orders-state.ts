import type { Order, OrderDetail } from "@mini-crm/data-access";

export interface OrdersState {
    orders: OrderDetail[];
    loading: boolean;
    error: string | null;
    selectedOrder: OrderDetail | null;
}

