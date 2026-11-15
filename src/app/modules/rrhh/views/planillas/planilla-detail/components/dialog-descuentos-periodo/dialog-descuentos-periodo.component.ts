import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DescuentosPlanillaComponent } from '../../../components/descuentos-planilla/descuentos-planilla.component';

export interface DialogDescuentosPeriodoData {
  periodId: number;
  periodName: string;
  periodoCerrado: boolean;
}

@Component({
  selector: 'app-dialog-descuentos-periodo',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatIconModule, DescuentosPlanillaComponent],
  template: `
    <div class="dialog-header">
      <div class="dialog-header__title">
        <mat-icon>remove_circle_outline</mat-icon>
        <h2 mat-dialog-title>Descuentos · {{ data.periodName }}</h2>
      </div>
      <button mat-icon-button (click)="cerrar()" aria-label="Cerrar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content class="dialog-content">
      <p class="hint-text">
        Registra aquí los descuentos de cualquier trabajador del periodo. Si su planilla aún no se generó, el descuento
        se aplicará al generarla; si ya se generó, se recalcula al instante. Los descuentos se conservan aunque se
        elimine y vuelva a generar la planilla.
      </p>
      <app-descuentos-planilla [periodId]="data.periodId" [periodoCerrado]="data.periodoCerrado" (cambio)="huboCambios = true">
      </app-descuentos-planilla>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="cerrar()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; min-width: 640px; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 12px 8px 4px 16px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .dialog-header__title { display: flex; align-items: center; gap: 10px; }
    .dialog-header__title mat-icon { color: var(--mat-sys-error); }
    .dialog-header__title h2 { margin: 0; font: var(--mat-sys-title-large); }
    .dialog-content { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; }
    .hint-text { margin: 0; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-small);
      background: var(--mat-sys-surface-container-high); padding: 10px 12px; border-radius: 8px; }
    @media (max-width: 700px) { :host { min-width: 0; } }
  `]
})
export class DialogDescuentosPeriodoComponent {

  readonly data = inject<DialogDescuentosPeriodoData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DialogDescuentosPeriodoComponent>);
  huboCambios = false;

  cerrar(): void {
    this.dialogRef.close(this.huboCambios);
  }
}
