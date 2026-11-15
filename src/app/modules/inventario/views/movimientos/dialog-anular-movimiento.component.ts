import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/** Pide el motivo de anulación. Cierra con el motivo (string) o undefined si se cancela. */
@Component({
  selector: 'app-dialog-anular-movimiento',
  standalone: true,
  imports: [FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Anular {{ data.number }}</h2>
    <mat-dialog-content>
      <p class="texto">Se registrará un movimiento inverso que revierte las cantidades. El movimiento original queda como
        anulado (no se borra).</p>
      <mat-form-field appearance="outline" class="campo">
        <mat-label>Motivo de la anulación</mat-label>
        <textarea matInput [(ngModel)]="motivo" rows="2" maxlength="300"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="!motivo.trim()" (click)="dialogRef.close(motivo.trim())">Anular</button>
    </mat-dialog-actions>
  `,
  styles: [`.campo { width: 100%; } .texto { margin: 0 0 12px; font: var(--mat-sys-body-medium); }`]
})
export class DialogAnularMovimientoComponent {
  readonly data = inject<{ number: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogAnularMovimientoComponent>);
  motivo = '';
}
