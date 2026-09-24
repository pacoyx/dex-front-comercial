import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { IPayrollSummary } from '../../../../../interfaces/IPayroll';
import { PayrollConceptTypeLabelPipe } from '../../../../../shared/payroll-concept-type';

@Component({
  selector: 'app-dialog-detalle-planilla-empleado',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, MatTableModule,
    CurrencyPipe, DatePipe, PayrollConceptTypeLabelPipe,
  ],
  templateUrl: './dialog-detalle-planilla-empleado.component.html',
  styleUrl: './dialog-detalle-planilla-empleado.component.css'
})
export class DialogDetallePlanillaEmpleadoComponent {

  readonly data = inject<{ payroll: IPayrollSummary }>(MAT_DIALOG_DATA);
  displayedColumns = ['concepto', 'descripcion', 'monto'];

  constructor(private dialogRef: MatDialogRef<DialogDetallePlanillaEmpleadoComponent>) { }

  cerrar(): void {
    this.dialogRef.close();
  }

}
