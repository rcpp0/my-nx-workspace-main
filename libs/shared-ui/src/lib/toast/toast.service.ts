import { Injectable, signal } from '@angular/core';

/**
 * Toast message data structure.
 *
 * @category Models
 */
export interface ToastMessage {
  /**
   * Unique identifier for the toast.
   */
  id: string;

  /**
   * Message to display in the toast.
   */
  message: string;

  /**
   * Bootstrap variant (success, danger, warning, info).
   * @default 'info'
   */
  variant?: 'success' | 'danger' | 'warning' | 'info';

  /**
   * Duration in milliseconds before auto-hiding.
   * Set to 0 or null to disable auto-hide.
   * @default 5000
   */
  duration?: number | null;
}

/**
 * Service for managing toast notifications.
 *
 * Provides methods to show toast messages with different variants.
 * Uses signals to manage toast state reactively.
 *
 * @usageNotes
 * ### Basic Usage
 * ```typescript
 * private toastService = inject(ToastService);
 *
 * // Show success toast
 * this.toastService.showSuccess('Opération réussie !');
 *
 * // Show error toast
 * this.toastService.showError('Une erreur est survenue');
 *
 * // Show info toast
 * this.toastService.showInfo('Information');
 *
 * // Show warning toast
 * this.toastService.showWarning('Attention');
 * ```
 *
 * ### Custom Toast
 * ```typescript
 * this.toastService.show({
 *   id: 'custom-toast',
 *   message: 'Message personnalisé',
 *   variant: 'success',
 *   duration: 3000
 * });
 * ```
 *
 * @see ToastComponent
 * @see ToastContainerComponent
 * @category Shared UI
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /**
   * List of active toast messages.
   * @readonly
   */
  readonly toasts = signal<ToastMessage[]>([]);

  /**
   * Shows a toast message.
   *
   * @param toast - Toast message configuration
   */
  show(toast: Omit<ToastMessage, 'id'> & { id?: string }): void {
    const toastMessage: ToastMessage = {
      id: toast.id ?? this.generateId(),
      message: toast.message,
      variant: toast.variant ?? 'info',
      duration: toast.duration ?? 5000,
    };

    this.toasts.update((toasts) => [...toasts, toastMessage]);

    // Auto-hide if duration is set
    if (toastMessage.duration && toastMessage.duration > 0) {
      setTimeout(() => {
        this.hide(toastMessage.id);
      }, toastMessage.duration);
    }
  }

  /**
   * Shows a success toast message.
   *
   * @param message - Success message to display
   * @param duration - Duration in milliseconds (default: 5000)
   */
  showSuccess(message: string, duration?: number): void {
    this.show({ message, variant: 'success', duration });
  }

  /**
   * Shows an error toast message.
   *
   * @param message - Error message to display
   * @param duration - Duration in milliseconds (default: 5000)
   */
  showError(message: string, duration?: number): void {
    this.show({ message, variant: 'danger', duration });
  }

  /**
   * Shows a warning toast message.
   *
   * @param message - Warning message to display
   * @param duration - Duration in milliseconds (default: 5000)
   */
  showWarning(message: string, duration?: number): void {
    this.show({ message, variant: 'warning', duration });
  }

  /**
   * Shows an info toast message.
   *
   * @param message - Info message to display
   * @param duration - Duration in milliseconds (default: 5000)
   */
  showInfo(message: string, duration?: number): void {
    this.show({ message, variant: 'info', duration });
  }

  /**
   * Hides a toast message by ID.
   *
   * @param id - Toast message ID to hide
   */
  hide(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Clears all toast messages.
   */
  clear(): void {
    this.toasts.set([]);
  }

  /**
   * Generates a unique ID for a toast message.
   *
   * @private
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

