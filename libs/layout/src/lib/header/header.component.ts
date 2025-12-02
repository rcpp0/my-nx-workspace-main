import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@mini-crm/data-access';
import { ToastService } from '@mini-crm/shared-ui';

/**
 * Header component for the application.
 *
 * Displays the application logo (briefcase icon) and title "Mini CRM".
 * Visible after user authentication. Features dark background with white text.
 * Includes a logout button that calls AuthService.logout(), shows a toast notification,
 * and redirects to sign-in page.
 *
 * @usageNotes
 * ### Basic Usage
 * ```html
 * <lib-header />
 * ```
 *
 * ### With Layout Component
 * ```html
 * <lib-layout>
 *   <lib-header layout-header />
 *   <!-- other content -->
 * </lib-layout>
 * ```
 *
 * @see LayoutComponent
 * @see SidebarComponent
 * @see AuthService
 * @see ToastService
 * @category Layout
 */
@Component({
  selector: 'lib-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  /**
   * Handles logout action.
   *
   * Calls AuthService.logout() to clear authentication state,
   * shows a success toast notification, then redirects to the sign-in page.
   */
  handleLogout(): void {
    this.authService.logout();
    this.toastService.showSuccess('Vous avez été déconnecté');
    this.router.navigate(['/auth/sign-in']);
  }
}

