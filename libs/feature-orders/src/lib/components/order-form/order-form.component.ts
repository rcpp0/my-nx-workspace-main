import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  computed,
  effect,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { OrderDetail, UpdateOrder } from '@mini-crm/data-access';

/**
 * Reusable form component for creating and editing orders.
 *
 * Displays a form with customer, nbDays, tjm, and tauxTva fields.
 * Shows calculated totalHt and totalTtc in real-time as computed signals.
 * Automatically patches the form when order input changes (edit mode).
 *
 * @usageNotes
 * ### Creating a New Order
 * ```html
 * <lib-order-form
 *   [order]="null"
 *   (save)="onSave($event)"
 *   (canceled)="onCancel()"
 * />
 * ```
 *
 * ### Editing an Existing Order
 * ```html
 * <lib-order-form
 *   [order]="selectedOrder()"
 *   (save)="onSave($event)"
 *   (canceled)="onCancel()"
 * />
 * ```
 *
 * ### Handling Save Event
 * ```typescript
 * onSave(orderData: CreateOrder | UpdateOrder) {
 *   if (this.selectedOrder()) {
 *     // Update existing order
 *     this.ordersService.update(orderData as UpdateOrder).subscribe();
 *   } else {
 *     // Create new order
 *     this.ordersService.create(orderData as CreateOrder).subscribe();
 *   }
 * }
 * ```
 *
 * @see OrderListComponent
 * @see OrderAddComponent
 * @see OrderEditComponent
 * @category Feature Orders
 */
@Component({
  selector: 'lib-order-form',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormComponent {
  private readonly fb = inject(FormBuilder);

  /**
   * Order to edit (null for creation mode).
   * @required
   */
  order = input<OrderDetail | null>(null);

  /**
   * Emitted when the form is submitted with valid data.
   * @event
   * @param orderData - Order data (UpdateOrder)
   */
  save = output<UpdateOrder>();

  /**
   * Emitted when the cancel button is clicked.
   * @event
   */
  canceled = output<void>();

  /**
   * Reactive form for order data.
   */
  form = this.fb.group({
    customer: ['', [Validators.required, Validators.minLength(2)]],
    nbDays: [1, [Validators.required, Validators.min(1)]],
    tjm: [0, [Validators.required, Validators.min(0)]],
    tauxTva: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  /**
   * Computed signal for totalHt (HT - Hors Taxes).
   * Calculated as: nbDays × tjm
   * @computed
   */
  totalHt = computed(() => {
    const nbDays = this.form.value.nbDays ?? 0;
    const tjm = this.form.value.tjm ?? 0;
    return nbDays * tjm;
  });

  /**
   * Computed signal for totalTtc (TTC - Toutes Taxes Comprises).
   * Calculated as: totalHt × (1 + tauxTva / 100)
   * @computed
   */
  totalTtc = computed(() => {
    const totalHt = this.totalHt();
    const tauxTva = this.form.value.tauxTva ?? 0;
    return totalHt * (1 + tauxTva / 100);
  });

  constructor() {
    // Patch form when order input changes (edit mode)
    effect(
      () => {
        const orderValue = this.order();
        if (orderValue) {
          // Edit mode: patch form with order data
          this.form.patchValue({
            customer: orderValue.customer,
            nbDays: orderValue.nbDays,
            tjm: orderValue.tjm,
            tauxTva: orderValue.tauxTva,
          });
        } else {
          // Create mode: reset form
          this.form.reset({
            customer: '',
            nbDays: 1,
            tjm: 0,
            tauxTva: 20,
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Handles form submission.
   * Emits save event with form data (CreateOrder or UpdateOrder).
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const orderValue = this.order();

    if (!formValue.customer || formValue.nbDays === null || formValue.tjm === null || formValue.tauxTva === null) {
      return;
    }

    // Always emit UpdateOrder (with id from order or 0 for creation)
    const updateOrder: UpdateOrder = {
      id: orderValue?.id || 0,
      customer: formValue.customer ?? '',
      nbDays: formValue.nbDays ?? 0,
      tjm: formValue.tjm ?? 0,
      tauxTva: formValue.tauxTva ?? 0,
    };
    this.save.emit(updateOrder);

  }

  /**
   * Handles cancel button click.
   * Emits canceled event.
   */
  onCancel(): void {
    this.canceled.emit();
  }

  /**
   * Checks if a form field has validation errors and has been touched.
   *
   * @param fieldName - Name of the form field
   * @returns True if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  /**
   * Gets the error message for a form field.
   *
   * @param fieldName - Name of the form field
   * @returns Error message or null
   */
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) {
      return null;
    }

    if (field.errors['required']) {
      return 'Ce champ est obligatoire';
    }

    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères requis`;
    }

    if (field.errors['min']) {
      return `La valeur doit être supérieure ou égale à ${field.errors['min'].min}`;
    }

    if (field.errors['max']) {
      return `La valeur doit être inférieure ou égale à ${field.errors['max'].max}`;
    }

    return null;
  }
}

