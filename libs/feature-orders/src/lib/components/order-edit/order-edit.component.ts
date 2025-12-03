import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  effect,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderFormComponent } from '../order-form/order-form.component';
import type { OrderDetail, UpdateOrder } from '@mini-crm/data-access';
import { ordersSignalStore } from '../../store/orders-signal-store';

/**
 * Component for editing an existing order.
 *
 * Retrieves the order ID from route parameters and loads the order data.
 * Uses OrderFormComponent in edit mode with the loaded order.
 * Handles order update and navigation back to the orders list.
 *
 * @usageNotes
 * ### In Routes
 * ```typescript
 * {
 *   path: 'orders/edit/:id',
 *   component: OrderEditComponent
 * }
 * ```
 *
 * ### Error Handling
 * If the order ID is invalid or the order doesn't exist,
 * the component automatically redirects to the orders list.
 *
 * @see OrderFormComponent
 * @see ordersSignalStore
 * @see OrderAddComponent
 * @category Feature Orders
 */
@Component({
  selector: 'lib-order-edit',
  imports: [OrderFormComponent],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderEditComponent implements OnInit {
  private readonly orderStore = inject(ordersSignalStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /**
   * Selected order from the store.
   * @readonly
   */
  readonly selectedOrder = this.orderStore.selectedOrder;

  /**
   * Loading state from the store.
   * @readonly
   */
  readonly loading = this.orderStore.loading;

  /**
   * Error state from the store.
   * @readonly
   */
  readonly error = this.orderStore.error;

  /**
   * Order to edit with calculated totals.
   * Computed from selectedOrder with totalHt and totalTtc calculated.
   * @readonly
   * @computed
   */
  readonly order = computed((): OrderDetail | null => {
    const baseOrder = this.selectedOrder();
    if (!baseOrder) {
      return null;
    }

    const nbDays = baseOrder.nbDays ?? 0;
    const tjm = baseOrder.tjm ?? 0;
    const tauxTva = baseOrder.tauxTva ?? 0;

    const totalHt = nbDays * tjm;
    const totalTtc = totalHt * (1 + tauxTva / 100);

    return {
      ...baseOrder,
      totalHt,
      totalTtc,
    };
  });

  constructor() {
    // Redirect to orders list if order becomes null (not found)
    effect(() => {
      const orderValue = this.order();
      const errorValue = this.error();
      const loadingValue = this.loading();

      // If order is null and we have an error, redirect to list
      if (
        orderValue === null &&
        errorValue &&
        !loadingValue
      ) {
        console.error('Order not found, redirecting to orders list');
        this.router.navigate(['/orders']);
      }
    });
  }

  ngOnInit(): void {
    // Get order ID from route parameters
    const orderIdParam = this.route.snapshot.paramMap.get('id');

    if (!orderIdParam) {
      console.error('Order ID is missing from route parameters');
      this.router.navigate(['/orders']);
      return;
    }

    const orderId = Number.parseInt(orderIdParam, 10);

    if (Number.isNaN(orderId)) {
      console.error(`Invalid order ID: ${orderIdParam}`);
      this.router.navigate(['/orders']);
      return;
    }

    // Load order by ID (will set selectedOrder)
    this.orderStore.selectOrder(orderId);
  }

  /**
   * Handles the save event from OrderFormComponent.
   * Updates the order and navigates to the orders list on success.
   *
   * @param orderData - Order data to update
   */
  onSave(orderData: UpdateOrder): void {
    this.orderStore.updateOrder(orderData);
    // Navigation after successful update
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

