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
import { IPosition } from '../../../interfaces/ICatalogos';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogFormCargoComponent } from './components/dialog-form-cargo/dialog-form-cargo.component';

@Component({
  selector: 'app-cargos',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './cargos.component.html',
  styleUrl: './cargos.component.css'
})
export class CargosComponent implements OnInit {

  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: IPosition[] = [];
  displayedColumns: string[] = ['actions', 'name', 'status'];
  dataSource = new MatTableDataSource<IPosition>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.catalogosService.listarCargos().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los cargos.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.name.toLowerCase().includes(texto));
  }

  nuevoCargo(): void {
    const dialogRef = this.dialog.open(DialogFormCargoComponent, {
      data: { esNuevo: true, obj: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarCargo(cargo: IPosition): void {
    const dialogRef = this.dialog.open(DialogFormCargoComponent, {
      data: { esNuevo: false, obj: cargo }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(cargo: IPosition): void {
    if (cargo.isActive) {
      if (!confirm(`Se desactivará el cargo "${cargo.name}". ¿Deseas continuar?`)) {
        return;
      }
      this.catalogosService.eliminarCargo(cargo.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Cargo desactivado correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar el cargo.'));
        }
      });
    } else {
      this.catalogosService.actualizarCargo(cargo.id, { name: cargo.name, isActive: true }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Cargo activado correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar el cargo.'));
        }
      });
    }
  }

}
