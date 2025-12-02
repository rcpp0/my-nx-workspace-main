import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@mini-crm/data-access';

/**
 * Header component for the application.
 *
 * Displays the application logo (briefcase icon) and title "Mini CRM".
 * Visible after user authentication. Features dark background with white text.
 * Includes a logout button that calls AuthService.logout() and redirects to sign-in page.
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

  /**
   * Handles logout action.
   *
   * Calls AuthService.logout() to clear authentication state,
   * then redirects to the sign-in page.
   */
  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/sign-in']);
  }
}

