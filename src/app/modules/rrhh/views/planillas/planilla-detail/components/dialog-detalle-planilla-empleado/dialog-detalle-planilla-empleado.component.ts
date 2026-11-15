import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { IPayrollSummary } from '../../../../../interfaces/IPayroll';
import { PayrollConceptTypeLabelPipe } from '../../../../../shared/payroll-concept-type';
import { DescuentosPlanillaComponent } from '../../../components/descuentos-planilla/descuentos-planilla.component';

export interface DialogDetallePlanillaEmpleadoData {
  payroll: IPayrollSummary;
  periodId: number;
  periodoCerrado: boolean;
}

@Component({
  selector: 'app-dialog-detalle-planilla-empleado',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, MatTableModule,
    CurrencyPipe, DatePipe, PayrollConceptTypeLabelPipe, DescuentosPlanillaComponent,
  ],
  templateUrl: './dialog-detalle-planilla-empleado.component.html',
  styleUrl: './dialog-detalle-planilla-empleado.component.css'
})
export class DialogDetallePlanillaEmpleadoComponent {

  readonly data = inject<DialogDetallePlanillaEmpleadoData>(MAT_DIALOG_DATA);
  displayedColumns = ['concepto', 'descripcion', 'monto'];

  payroll: IPayrollSummary = this.data.payroll;
  private huboCambios = false;

  constructor(private dialogRef: MatDialogRef<DialogDetallePlanillaEmpleadoComponent>) { }

  onPlanillaActualizada(payroll: IPayrollSummary): void {
    this.payroll = payroll;
  }

  onCambio(): void {
    this.huboCambios = true;
  }

  cerrar(): void {
    // true => la vista de planilla debe recargar totales.
    this.dialogRef.close(this.huboCambios);
  }

}
