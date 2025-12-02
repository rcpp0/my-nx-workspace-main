import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';

/**
 * Container component for displaying toast notifications.
 *
 * Displays all active toasts from ToastService in a fixed position
 * (top-right corner by default). Should be included once in the app root.
 *
 * @usageNotes
 * ### Basic Usage
 * Add to app.component.html:
 * ```html
 * <lib-toast-container />
 * ```
 *
 * ### Show Toast
 * ```typescript
 * private toastService = inject(ToastService);
 * this.toastService.showSuccess('Opération réussie !');
 * ```
 *
 * @see ToastService
 * @see ToastComponent
 * @category Shared UI
 */
@Component({
  selector: 'lib-toast-container',
  imports: [ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  /**
   * Toast service instance.
   */
  readonly toastService = inject(ToastService);

  /**
   * Active toasts from the service.
   * @readonly
   */
  readonly toasts = this.toastService.toasts;
}

