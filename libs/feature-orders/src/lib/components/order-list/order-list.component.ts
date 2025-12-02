import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrdersService } from '@mini-crm/data-access';
import { ConfirmModalComponent } from '@mini-crm/shared-ui';
import type { OrderDetail as OrderType } from '@mini-crm/data-access';

// Bootstrap Modal type from @types/bootstrap
declare const bootstrap: {
  Modal: {
    getOrCreateInstance: (
      element: HTMLElement | string,
      options?: { backdrop?: boolean | string; keyboard?: boolean }
    ) => {
      show: () => void;
      hide: () => void;
      dispose: () => void;
    };
  };
};

/**
 * Order list component displaying all orders in a responsive Bootstrap table.
 *
 * Provides CRUD actions: view, edit, delete, and add new order.
 * Uses ConfirmModalComponent for delete confirmation.
 *
 * @usageNotes
 * ### Basic Usage
 * ```html
 * <lib-order-list />
 * ```
 *
 * ### In Routes
 * ```typescript
 * {
 *   path: 'orders',
 *   component: OrderListComponent
 * }
 * ```
 *
 * @see OrdersService
 * @see ConfirmModalComponent
 * @see Order
 * @category Feature Orders
 */
@Component({
  selector: 'lib-order-list',
  imports: [RouterLink, ConfirmModalComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  /**
   * ID of the order to delete (set when delete button is clicked).
   */
  orderToDeleteId = signal<number | null>(null);

  /**
   * Modal ID constant for the delete confirmation modal.
   */
  private readonly MODAL_ID = 'deleteOrderModal';

  /**
   * Orders list from the service.
   * @readonly
   */
  orders = this.ordersService.orders as typeof this.ordersService.orders & { (): OrderType[] };

  /**
   * Loading state from the service.
   * @readonly
   */
  loading = this.ordersService.loading;

  /**
   * Error message from the service.
   * @readonly
   */
  error = this.ordersService.error;

  ngOnInit(): void {
    // Load orders on component initialization
    this.ordersService.getAll().subscribe({
      next: () => {
        // Orders are automatically updated in the service signal
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
      },
    });
  }

  /**
   * Handles the edit button click.
   * Navigates to the edit page for the specified order.
   *
   * @param orderId - ID of the order to edit
   */
  onEdit(orderId: number): void {
    this.router.navigate(['/orders', 'edit', orderId]);
  }

  /**
   * Handles the delete button click.
   * Opens the confirmation modal and stores the order ID.
   *
   * @param orderId - ID of the order to delete
   */
  onDeleteClick(orderId: number): void {
    this.orderToDeleteId.set(orderId);
    this.showModal();
  }

  /**
   * Handles the confirmation from the modal.
   * Deletes the order and refreshes the list.
   */
  onConfirmDelete(): void {
    const orderId = this.orderToDeleteId();
    if (orderId === null) {
      return;
    }

    this.ordersService.delete(orderId).subscribe({
      next: () => {
        // Orders list is automatically refreshed by the service
        this.orderToDeleteId.set(null);
      },
      error: (err) => {
        console.error('Failed to delete order:', err);
        this.orderToDeleteId.set(null);
      },
    });
  }

  /**
   * Opens the confirmation modal using Bootstrap API.
   */
  private showModal(): void {
    if (typeof bootstrap === 'undefined') {
      console.error('Bootstrap is not loaded');
      return;
    }

    const modalElement = document.getElementById(this.MODAL_ID);
    if (!modalElement) {
      console.error(`Modal element with ID "${this.MODAL_ID}" not found`);
      return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement, {
      backdrop: true,
      keyboard: true,
    });
    modal.show();
  }

  /**
   * Formats a number as currency in euros.
   *
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}

