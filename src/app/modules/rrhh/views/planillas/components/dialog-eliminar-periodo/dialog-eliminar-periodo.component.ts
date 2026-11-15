import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface DialogEliminarPeriodoData {
  periodName: string;
}

/**
 * Confirmación reforzada para eliminar un periodo completo: hay que escribir el nombre exacto del periodo.
 * Cierra con `true` si se confirmó.
 */
@Component({
  selector: 'app-dialog-eliminar-periodo',
  standalone: true,
  imports: [
    FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatFormFieldModule,
    MatIconModule, MatInputModule,
  ],
  template: `
    <div class="dialog-header">
      <mat-icon>warning</mat-icon>
      <h2 mat-dialog-title>Eliminar periodo</h2>
    </div>
    <mat-dialog-content class="dialog-content">
      <p>Se eliminará <strong>todo</strong> el periodo <strong>"{{ data.periodName }}"</strong>:</p>
      <ul>
        <li>Las planillas generadas de todos los trabajadores.</li>
        <li>Los descuentos registrados en el periodo.</li>
        <li>El periodo (nombre, frecuencia y fechas).</li>
      </ul>
      <p>Las cuotas de préstamos y adelantos descontadas volverán a quedar pendientes.</p>
      <p class="aviso">Esta acción no se puede deshacer. Si solo quieres regenerar la planilla, usa
        "Eliminar planilla generada".</p>
      <mat-form-field appearance="outline" class="campo">
        <mat-label>Escribe el nombre del periodo para confirmar</mat-label>
        <input matInput [(ngModel)]="confirmacion" autocomplete="off" (keydown.enter)="confirmar()">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="cancelar()">Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="!coincide" (click)="confirmar()">
        <mat-icon>delete_forever</mat-icon>
        Eliminar periodo
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; max-width: 520px; }
    .dialog-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px 4px; }
    .dialog-header mat-icon { color: var(--mat-sys-error); }
    .dialog-header h2 { margin: 0; padding: 0; font: var(--mat-sys-title-large); }
    .dialog-content { display: flex; flex-direction: column; gap: 4px; }
    .dialog-content p, .dialog-content ul { margin: 0 0 6px; font: var(--mat-sys-body-medium); }
    .aviso { color: var(--mat-sys-error); }
    .campo { width: 100%; margin-top: 8px; }
  `]
})
export class DialogEliminarPeriodoComponent {

  readonly data = inject<DialogEliminarPeriodoData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DialogEliminarPeriodoComponent>);

  confirmacion = '';

  get coincide(): boolean {
    return this.confirmacion.trim() === this.data.periodName.trim();
  }

  confirmar(): void {
    if (this.coincide) this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
