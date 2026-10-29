import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { WebOrdersService } from '../../../services/web-orders.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { IDistrictAdmin } from '../../../interfaces/IDistrict';
import { DialogFormRegDistritoComponent } from './components/dialog-form-reg-distrito/dialog-form-reg-distrito.component';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-mnt-distritos',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatButtonModule],
  templateUrl: './mnt-distritos.component.html',
  styleUrl: './mnt-distritos.component.css'
})
export class MntDistritosComponent implements OnInit {
  webOrdersService = inject(WebOrdersService);
  notificationService = inject(NotificationServiceService);
  dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'zoneName', 'isActive', 'operaciones'];
  dataSource = new MatTableDataSource<IDistrictAdmin>([]);

  ngOnInit(): void {
    this.cargarDistritos();
  }

  cargarDistritos(): void {
    this.webOrdersService.listarDistritos().subscribe({
      next: (resp) => {
        this.dataSource = new MatTableDataSource(resp.data);
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los distritos.'));
      }
    });
  }

  crearDistrito(): void {
    const dialogRef = this.dialog.open(DialogFormRegDistritoComponent, {
      width: '420px',
      data: { esNuevo: true, distrito: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarDistritos();
    });
  }

  editarDistrito(item: IDistrictAdmin): void {
    const dialogRef = this.dialog.open(DialogFormRegDistritoComponent, {
      width: '420px',
      data: { esNuevo: false, distrito: item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarDistritos();
    });
  }
}
