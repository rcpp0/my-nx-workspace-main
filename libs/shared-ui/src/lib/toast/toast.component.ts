import {
  Component,
  ChangeDetectionStrategy,
  input,
  effect,
  viewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { ToastService, type ToastMessage } from './toast.service';

// Bootstrap Toast type from @types/bootstrap
declare const bootstrap: {
  Toast: {
    new (
      element: HTMLElement,
      options?: { autohide?: boolean; delay?: number }
    ): {
      show: () => void;
      hide: () => void;
      dispose: () => void;
    };
    getInstance: (element: HTMLElement) => {
      show: () => void;
      hide: () => void;
      dispose: () => void;
    } | null;
  };
};

/**
 * Individual toast component using Bootstrap 5 toast.
 *
 * Displays a single toast message with Bootstrap styling.
 * Automatically shows the toast when the component is initialized.
 *
 * @usageNotes
 * This component is used internally by ToastContainerComponent.
 * Do not use directly. Use ToastService instead.
 *
 * @see ToastService
 * @see ToastContainerComponent
 * @category Shared UI
 */
@Component({
  selector: 'lib-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  /**
   * Toast message data to display.
   * @required
   */
  toast = input.required<ToastMessage>();

  /**
   * Reference to the toast element for Bootstrap API.
   */
  private toastElement = viewChild<ElementRef<HTMLElement>>('toastElement');

  constructor() {
    // Show toast when component is initialized
    effect(() => {
      const element = this.toastElement()?.nativeElement;
      if (element) {
        const toastInstance = new bootstrap.Toast(element, {
          autohide: false, // We handle auto-hide via service
        });
        toastInstance.show();

        // Cleanup when toast is hidden
        element.addEventListener('hidden.bs.toast', () => {
          this.toastService.hide(this.toast().id);
          toastInstance.dispose();
        });
      }
    });
  }

  /**
   * Handles manual close button click.
   */
  handleClose(): void {
    const element = this.toastElement()?.nativeElement;
    if (element) {
      const toastInstance = bootstrap.Toast.getInstance(element);
      toastInstance?.hide();
    }
  }

  /**
   * Gets Bootstrap toast classes based on variant.
   */
  getToastClasses(): string {
    return 'toast';
  }

  /**
   * Gets Bootstrap icon classes based on variant.
   */
  getIconClasses(): string {
    const variant = this.toast().variant ?? 'info';
    const icons: Record<string, string> = {
      success: 'bi bi-check-circle-fill text-success',
      danger: 'bi bi-exclamation-circle-fill text-danger',
      warning: 'bi bi-exclamation-triangle-fill text-warning',
      info: 'bi bi-info-circle-fill text-info',
    };
    return icons[variant] ?? icons['info'];
  }
}

