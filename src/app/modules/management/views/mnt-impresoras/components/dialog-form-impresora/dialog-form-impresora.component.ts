import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaestrosService } from '../../../../../recepcion/services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IPrinterCreateDto, IPrinterEditDto } from '../../../../../recepcion/interfaces/IPrinter';
import { IWorkerNodeResponseDto } from '../../../../../recepcion/interfaces/IWorkerNode';

@Component({
  selector: 'app-dialog-form-impresora',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-impresora.component.html',
  styleUrl: './dialog-form-impresora.component.css'
})
export class DialogFormImpresoraComponent implements OnInit {
  readonly data = inject<{ esNuevo: boolean, objImpresora: IPrinterEditDto }>(MAT_DIALOG_DATA);
  maestroService = inject(MaestrosService);
  impresoraForm: FormGroup;

  loadingSave = false;
  workerNodes: IWorkerNodeResponseDto[] = [];
  titulo = this.data.esNuevo ? 'Registrar Impresora' : 'Actualizar Impresora';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormImpresoraComponent>,
  ) {

    this.impresoraForm = this.fb.group({
      id: 0,
      workerNodeId: ['', Validators.required],
      windowsPrinterName: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.cargarWorkerNodes();
    this.impresoraForm.reset();
    if (!this.data.esNuevo) {
      this.impresoraForm.patchValue(this.data.objImpresora);
    }
  }

  cargarWorkerNodes(): void {
    this.maestroService.obtenerWorkerNodes().subscribe({
      next: (response) => {
        this.workerNodes = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.impresoraForm.invalid) {
      return;
    }

    const impresoraData = this.impresoraForm.value;
    const impresoraDataCreate: IPrinterCreateDto = impresoraData;
    const impresoraDataUpdate: IPrinterEditDto = impresoraData;

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.maestroService.crearImpresora(impresoraDataCreate)
      : this.maestroService.actualizarImpresora(impresoraDataUpdate);

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
