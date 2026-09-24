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
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { IUnitMeasurement } from '../../../interfaces/IMaestros';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogFormRegUnitMeasurementComponent } from './components/dialog-form-reg-unit-measurement/dialog-form-reg-unit-measurement.component';

@Component({
  selector: 'app-unit-measurement',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './unit-measurement.component.html',
  styleUrl: './unit-measurement.component.css'
})
export class UnitMeasurementComponent implements OnInit {

  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: IUnitMeasurement[] = [];
  displayedColumns: string[] = ['actions', 'codeUm', 'name', 'description', 'status'];
  dataSource = new MatTableDataSource<IUnitMeasurement>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.purchaseSettingService.listarUnidadesMedida().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las unidades de medida.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item =>
        item.name.toLowerCase().includes(texto) || item.codeUm.toLowerCase().includes(texto)
      );
  }

  nuevaUnidadMedida(): void {
    const dialogRef = this.dialog.open(DialogFormRegUnitMeasurementComponent, {
      data: { esNuevo: true, objUnitMeasurement: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarUnidadMedida(unitMeasurement: IUnitMeasurement): void {
    const dialogRef = this.dialog.open(DialogFormRegUnitMeasurementComponent, {
      data: { esNuevo: false, objUnitMeasurement: unitMeasurement }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(unitMeasurement: IUnitMeasurement): void {
    if (unitMeasurement.status === 'A') {
      if (!confirm(`Se desactivará la unidad de medida "${unitMeasurement.name}". ¿Deseas continuar?`)) {
        return;
      }
      this.purchaseSettingService.eliminarUnidadMedida(unitMeasurement.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Unidad de medida desactivada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar la unidad de medida.'));
        }
      });
    } else {
      this.purchaseSettingService.actualizarUnidadMedida({ ...unitMeasurement, status: 'A' }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Unidad de medida activada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar la unidad de medida.'));
        }
      });
    }
  }

}
