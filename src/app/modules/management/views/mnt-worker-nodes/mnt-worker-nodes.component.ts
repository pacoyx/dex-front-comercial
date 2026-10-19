import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MaestrosService } from '../../../recepcion/services/maestros.service';
import { IWorkerNodeEditDto, IWorkerNodeResponseDto } from '../../../recepcion/interfaces/IWorkerNode';
import { ISucursalesCombo } from '../../../recepcion/interfaces/IReports';
import { DialogFormWorkerNodeComponent } from './components/dialog-form-worker-node/dialog-form-worker-node.component';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-mnt-worker-nodes',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatSortModule, MatButtonModule, DatePipe
  ],
  templateUrl: './mnt-worker-nodes.component.html',
  styleUrl: './mnt-worker-nodes.component.css'
})
export class MntWorkerNodesComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    'id',
    'computerName',
    'workerKey',
    'branchId',
    'isActive',
    'lastConnectionAt',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IWorkerNodeResponseDto>([]);
  sucursales: ISucursalesCombo[] = [];

  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarWorkerNodes();
  }

  cargarSucursales(): void {
    this.maestroSerivce.obtenerSucursalesCombo().subscribe({
      next: (response) => {
        this.sucursales = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarWorkerNodes(): void {
    this.maestroSerivce.obtenerWorkerNodes().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getSucursalDescripcion(branchId: number): string {
    return this.sucursales.find(s => s.id === branchId)?.description ?? branchId.toString();
  }

  crearWorkerNode() {
    const dialogRef = this.dialog.open(DialogFormWorkerNodeComponent, {
      width: '400px',
      data: { esNuevo: true, objWorkerNode: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarWorkerNodes();
      }
    });
  }

  editWorkerNode(item: IWorkerNodeResponseDto) {
    const objWorkerNode: IWorkerNodeEditDto = {
      id: item.id,
      branchId: item.branchId,
      workerKey: item.workerKey,
      computerName: item.computerName,
      isActive: item.isActive
    };

    const dialogRef = this.dialog.open(DialogFormWorkerNodeComponent, {
      width: '400px',
      data: { esNuevo: false, objWorkerNode: objWorkerNode }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarWorkerNodes();
      }
    });
  }

  deleteWorkerNode(item: IWorkerNodeResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Worker Node', message: `¿Está seguro de eliminar el worker node ${item.computerName}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarWorkerNode(item.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarWorkerNodes();
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
