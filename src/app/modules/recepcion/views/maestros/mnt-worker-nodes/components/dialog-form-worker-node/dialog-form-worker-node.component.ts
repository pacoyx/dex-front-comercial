import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaestrosService } from '../../../../../services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IWorkerNodeCreateDto, IWorkerNodeEditDto } from '../../../../../interfaces/IWorkerNode';
import { ISucursalesCombo } from '../../../../../interfaces/IReports';

@Component({
  selector: 'app-dialog-form-worker-node',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-worker-node.component.html',
  styleUrl: './dialog-form-worker-node.component.css'
})
export class DialogFormWorkerNodeComponent implements OnInit {
  readonly data = inject<{ esNuevo: boolean, objWorkerNode: IWorkerNodeEditDto }>(MAT_DIALOG_DATA);
  maestroService = inject(MaestrosService);
  workerNodeForm: FormGroup;

  loadingSave = false;
  sucursales: ISucursalesCombo[] = [];
  titulo = this.data.esNuevo ? 'Registrar Worker Node' : 'Actualizar Worker Node';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormWorkerNodeComponent>,
  ) {

    this.workerNodeForm = this.fb.group({
      id: 0,
      branchId: ['', Validators.required],
      workerKey: ['', Validators.required],
      computerName: ['', Validators.required],
      isActive: [true, Validators.required],
    });

  }

  ngOnInit(): void {
    this.cargarSucursales();
    this.workerNodeForm.reset({ isActive: true });
    if (!this.data.esNuevo) {
      this.workerNodeForm.patchValue(this.data.objWorkerNode);
    }
  }

  cargarSucursales(): void {
    this.maestroService.obtenerSucursalesCombo().subscribe({
      next: (response) => {
        this.sucursales = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.workerNodeForm.invalid) {
      return;
    }

    const workerNodeData = this.workerNodeForm.value;
    const workerNodeDataCreate: IWorkerNodeCreateDto = workerNodeData;
    const workerNodeDataUpdate: IWorkerNodeEditDto = workerNodeData;

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.maestroService.crearWorkerNode(workerNodeDataCreate)
      : this.maestroService.actualizarWorkerNode(workerNodeDataUpdate);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp);
      },
      error: (err) => {
        console.log(err);
        this.loadingSave = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
