import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';

@Component({
  selector: 'app-layout-management',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  templateUrl: './layout-management.component.html',
  styleUrl: './layout-management.component.scss'
})
export class LayoutManagementComponent {

  private toggleStore = inject(ToggleStoreServiceService);

  toggleSidenav() {
    this.toggleStore.setToggleState(true);
  }

}
