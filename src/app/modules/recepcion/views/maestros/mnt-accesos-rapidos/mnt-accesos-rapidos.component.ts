import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MaestrosService } from '../../../services/maestros.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { IServiceAccessFastAdmin } from '../../../interfaces/IServiceAccessFast';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogFormAccessFastComponent } from './components/dialog-form-access-fast/dialog-form-access-fast.component';

@Component({
  selector: 'app-mnt-accesos-rapidos',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, DragDropModule],
  templateUrl: './mnt-accesos-rapidos.component.html',
  styleUrl: './mnt-accesos-rapidos.component.css'
})
export class MntAccesosRapidosComponent implements OnInit {
  private readonly maestrosService = inject(MaestrosService);
  private readonly notificationService = inject(NotificationServiceService);
  private readonly dialog = inject(MatDialog);

  items: IServiceAccessFastAdmin[] = [];
  loading = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.maestrosService.obtenerAccesosRapidos().subscribe({
      next: (resp) => {
        this.loading = false;
        this.items = resp.data ?? [];
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los accesos rápidos.'));
      }
    });
  }

  drop(event: CdkDragDrop<IServiceAccessFastAdmin[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    // Refleja el nuevo orden en pantalla de inmediato; el backend recalcula Order para
    // cada Id segun su posicion en esta misma lista (ver ReorderServiceAccessFastEndpoint).
    this.items.forEach((item, index) => { item.order = index + 1; });

    this.maestrosService.reordenarAccesosRapidos(this.items.map((i) => i.id)).subscribe({
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el nuevo orden.'));
        this.cargar();
      }
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(DialogFormAccessFastComponent, { data: { esNuevo: true, item: null } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editar(item: IServiceAccessFastAdmin): void {
    const dialogRef = this.dialog.open(DialogFormAccessFastComponent, { data: { esNuevo: false, item } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  eliminar(item: IServiceAccessFastAdmin): void {
    if (!confirm(`¿Eliminar el acceso rápido "${item.shortName}"?`)) {
      return;
    }

    this.maestrosService.eliminarAccesoRapido(item.id).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.notificationService.showSuccess('Acceso rápido eliminado correctamente.');
          this.cargar();
        }
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el acceso rápido.'));
      }
    });
  }
}
