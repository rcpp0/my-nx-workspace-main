import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { OrderFormComponent } from '../order-form/order-form.component';
import type { CreateOrder } from '@mini-crm/data-access';
import { ordersSignalStore } from '../../store/orders-signal-store';

/**
 * Component for adding a new order.
 *
 * Uses OrderFormComponent in create mode (order = null).
 * Handles order creation and navigation back to the orders list.
 *
 * @usageNotes
 * ### In Routes
 * ```typescript
 * {
 *   path: 'orders/add',
 *   component: OrderAddComponent
 * }
 * ```
 *
 * @see OrderFormComponent
 * @see OrdersService
 * @see OrderEditComponent
 * @category Feature Orders
 */
@Component({
  selector: 'lib-order-add',
  imports: [OrderFormComponent],
  templateUrl: './order-add.component.html',
  styleUrl: './order-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ordersSignalStore],
})
export class OrderAddComponent {

  private readonly orderStore = inject(ordersSignalStore);
  private readonly router = inject(Router);

  /**
   * Handles the save event from OrderFormComponent.
   * Creates a new order and navigates to the orders list on success.
   *
   * @param orderData - Order data to create
   */
  onSave(orderData: CreateOrder): void {
    this.orderStore.addOrder(orderData);
    this.router.navigate(['/orders']);
  }

  /**
   * Handles the cancel event from OrderFormComponent.
   * Navigates back to the orders list without saving.
   */
  onCancel(): void {
    this.router.navigate(['/orders']);
  }
}

