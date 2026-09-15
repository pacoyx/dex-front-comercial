import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MaestrosService } from '../../../services/maestros.service';
import { IPrinterEditDto, IPrinterResponseDto } from '../../../interfaces/IPrinter';
import { IWorkerNodeResponseDto } from '../../../interfaces/IWorkerNode';
import { DialogFormImpresoraComponent } from './components/dialog-form-impresora/dialog-form-impresora.component';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-mnt-impresoras',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatSortModule, MatButtonModule, DatePipe
  ],
  templateUrl: './mnt-impresoras.component.html',
  styleUrl: './mnt-impresoras.component.css'
})
export class MntImpresorasComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    'id',
    'windowsPrinterName',
    'workerNodeId',
    'isActive',
    'lastDiscoveredAt',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IPrinterResponseDto>([]);
  workerNodes: IWorkerNodeResponseDto[] = [];

  ngOnInit(): void {
    this.cargarWorkerNodes();
    this.cargarImpresoras();
  }

  cargarWorkerNodes(): void {
    this.maestroSerivce.obtenerWorkerNodes().subscribe({
      next: (response) => {
        this.workerNodes = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarImpresoras(): void {
    this.maestroSerivce.obtenerImpresoras().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getWorkerNodeDescripcion(workerNodeId: number): string {
    const workerNode = this.workerNodes.find(w => w.id === workerNodeId);
    return workerNode ? `${workerNode.computerName} (${workerNode.workerKey})` : workerNodeId.toString();
  }

  crearImpresora() {
    const dialogRef = this.dialog.open(DialogFormImpresoraComponent, {
      width: '400px',
      data: { esNuevo: true, objImpresora: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarImpresoras();
      }
    });
  }

  editImpresora(item: IPrinterResponseDto) {
    const objImpresora: IPrinterEditDto = {
      id: item.id,
      workerNodeId: item.workerNodeId,
      windowsPrinterName: item.windowsPrinterName
    };

    const dialogRef = this.dialog.open(DialogFormImpresoraComponent, {
      width: '400px',
      data: { esNuevo: false, objImpresora: objImpresora }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarImpresoras();
      }
    });
  }

  deleteImpresora(item: IPrinterResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Impresora', message: `¿Está seguro de eliminar la impresora ${item.windowsPrinterName}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarImpresora(item.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarImpresoras();
            }
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }
}
