import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { VehiclesService } from '../../services/vehicles.service';
import { IVehicle } from '../../interfaces/IVehicle';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogFormVehicleComponent } from './components/dialog-form-vehicle/dialog-form-vehicle.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatSlideToggleModule, MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit {

  private vehiclesService = inject(VehiclesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['plate', 'description', 'isActive', 'operaciones'];
  dataSource = new MatTableDataSource<IVehicle>([]);
  loading = false;
  mostrarInactivos = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.vehiclesService.listar(this.mostrarInactivos).subscribe({
      next: (resp) => {
        this.dataSource.data = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los vehículos.'));
      },
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(DialogFormVehicleComponent, {
      width: '480px',
      data: { esNuevo: true, vehicle: null },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  editar(vehicle: IVehicle): void {
    const dialogRef = this.dialog.open(DialogFormVehicleComponent, {
      width: '480px',
      data: { esNuevo: false, vehicle },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  desactivar(vehicle: IVehicle): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Desactivar Vehículo',
        message: `¿Está seguro de desactivar el vehículo "${vehicle.plate}"? Dejará de estar disponible para asignar a nuevas guías.`,
        msgButton: 'Desactivar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.vehiclesService.desactivar(vehicle.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Vehículo desactivado correctamente.');
            this.cargar();
          },
          error: (err) => {
            this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar el vehículo.'));
          },
        });
      }
    });
  }

  reactivar(vehicle: IVehicle): void {
    this.vehiclesService.actualizar(vehicle.id, {
      plate: vehicle.plate,
      description: vehicle.description,
      isActive: true,
    }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Vehículo reactivado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo reactivar el vehículo.'));
      },
    });
  }

}
