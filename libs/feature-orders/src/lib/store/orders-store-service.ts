import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectOrderError, selectOrderLoading, selectOrders, selectSelectedOrder } from './orders-selectors';
import { CreateOrder } from '@mini-crm/data-access';
import { addOrder, deleteOrder, updateOrder, loadOrders } from './orders-actions';
import { UpdateOrder } from '@mini-crm/data-access';

@Injectable({
  providedIn: 'root'
})
export class OrdersStoreService {
  
  private readonly store = inject(Store);

  orders = this.store.selectSignal(selectOrders)

  selected = this.store.selectSignal(selectSelectedOrder);
  
  load() {
    this.store.dispatch(loadOrders());
  }

  add(order: CreateOrder) {
    this.store.dispatch(addOrder({ order }));
  }

  update(order: UpdateOrder) {
    this.store.dispatch(updateOrder({ order }));
  }

  delete(id: number) {
    this.store.dispatch(deleteOrder({ id }));
  }

  loading = this.store.selectSignal(selectOrderLoading);

  error = this.store.selectSignal(selectOrderError);
}
