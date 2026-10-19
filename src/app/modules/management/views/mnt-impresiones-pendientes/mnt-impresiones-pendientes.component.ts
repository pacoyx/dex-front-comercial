import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MaestrosService } from '../../../recepcion/services/maestros.service';
import { IPrintQueueResponseDto } from '../../interfaces/IPrintQueue';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-mnt-impresiones-pendientes',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatSortModule, MatButtonModule, MatTooltipModule, DatePipe
  ],
  templateUrl: './mnt-impresiones-pendientes.component.html',
  styleUrl: './mnt-impresiones-pendientes.component.css'
})
export class MntImpresionesPendientesComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    'id',
    'workGuideId',
    'printerId',
    'documentType',
    'retryCount',
    'status',
    'createdAt',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IPrintQueueResponseDto>([]);

  ngOnInit(): void {
    this.cargarImpresionesPendientes();
  }

  cargarImpresionesPendientes(): void {
    this.maestroSerivce.obtenerImpresionesPendientes().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cancelarImpresion(item: IPrintQueueResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Cancelar Impresión', message: `¿Está seguro de cancelar la impresión #${item.id}?`, msgButton: 'Cancelar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.cancelarImpresionPendiente(item.id).subscribe({
          next: () => {
            this.cargarImpresionesPendientes();
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }

  reimprimirImpresion(item: IPrintQueueResponseDto) {
    this.maestroSerivce.reimprimirImpresionPendiente(item.id).subscribe({
      next: () => {
        this.cargarImpresionesPendientes();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
