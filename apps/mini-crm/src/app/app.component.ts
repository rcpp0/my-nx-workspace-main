import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  LayoutComponent,
  HeaderComponent,
  SidebarComponent,
} from '@mini-crm/layout';
import { ToastContainerComponent } from '@mini-crm/shared-ui';

/**
 * Root application component.
 *
 * Uses LayoutComponent with content projection for header and sidebar.
 * The router-outlet is handled by LayoutComponent.
 * Includes ToastContainerComponent for displaying toast notifications.
 *
 * @category App
 */
@Component({
  selector: 'app-root',
  imports: [
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
