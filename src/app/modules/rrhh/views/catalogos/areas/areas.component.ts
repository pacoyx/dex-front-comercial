import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CatalogosService } from '../../../services/catalogos.service';
import { IArea } from '../../../interfaces/ICatalogos';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogFormAreaComponent } from './components/dialog-form-area/dialog-form-area.component';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css'
})
export class AreasComponent implements OnInit {

  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: IArea[] = [];
  displayedColumns: string[] = ['actions', 'name', 'status'];
  dataSource = new MatTableDataSource<IArea>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.catalogosService.listarAreas().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las áreas.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.name.toLowerCase().includes(texto));
  }

  nuevaArea(): void {
    const dialogRef = this.dialog.open(DialogFormAreaComponent, {
      data: { esNuevo: true, obj: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarArea(area: IArea): void {
    const dialogRef = this.dialog.open(DialogFormAreaComponent, {
      data: { esNuevo: false, obj: area }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(area: IArea): void {
    if (area.isActive) {
      if (!confirm(`Se desactivará el área "${area.name}". ¿Deseas continuar?`)) {
        return;
      }
      this.catalogosService.eliminarArea(area.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Área desactivada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar el área.'));
        }
      });
    } else {
      this.catalogosService.actualizarArea(area.id, { name: area.name, isActive: true }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Área activada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar el área.'));
        }
      });
    }
  }

}
