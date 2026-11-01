import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MaestrosService } from '../../../services/maestros.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { ICatService } from '../../../interfaces/ICatService';
import { DialogFormCatServiceComponent } from './components/dialog-form-cat-service/dialog-form-cat-service.component';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

@Component({
  selector: 'app-mnt-categorias-servicio',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatButtonModule, MatTooltipModule],
  templateUrl: './mnt-categorias-servicio.component.html',
  styleUrl: './mnt-categorias-servicio.component.css'
})
export class MntCategoriasServicioComponent implements OnInit {
  maestrosService = inject(MaestrosService);
  notificationService = inject(NotificationServiceService);
  dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'description', 'icon', 'operaciones'];
  dataSource = new MatTableDataSource<ICatService>([]);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.maestrosService.obtenerCategoriasServicio().subscribe({
      next: (resp) => {
        this.dataSource = new MatTableDataSource(resp);
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las categorías de servicio.'));
      }
    });
  }

  crearCategoria(): void {
    const dialogRef = this.dialog.open(DialogFormCatServiceComponent, {
      width: '420px',
      data: { esNuevo: true, categoria: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarCategorias();
    });
  }

  editarCategoria(item: ICatService): void {
    const dialogRef = this.dialog.open(DialogFormCatServiceComponent, {
      width: '420px',
      data: { esNuevo: false, categoria: item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarCategorias();
    });
  }

  eliminarCategoria(item: ICatService): void {
    if (!confirm(`¿Está seguro de eliminar la categoría "${item.name}"?`)) {
      return;
    }

    this.maestrosService.eliminarCategoriaServicio(item.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Categoría de servicio eliminada correctamente.');
        this.cargarCategorias();
      },
      error: (err) => {
        const validation = extractValidationErrors(err);
        const mensaje = validation.length > 0 ? validation[0] : extractErrorMessage(err, 'No se pudo eliminar la categoría de servicio.');
        this.notificationService.showError(mensaje);
      }
    });
  }
}
