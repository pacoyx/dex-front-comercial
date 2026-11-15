import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InventarioService } from '../../services/inventario.service';
import { IBranchOption, IWarehouse } from '../../interfaces/IInventario';
import { mensajeError } from '../../shared/http-error.util';

/** Crear o editar un almacén. Cierra con true si se grabó. */
@Component({
  selector: 'app-dialog-almacen',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule],
  template: `
    <h2 mat-dialog-title>{{ data.almacen ? 'Editar almacén' : 'Nuevo almacén' }}</h2>
    <mat-dialog-content>
      @if (error) { <div class="error">{{ error }}</div> }
      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Código</mat-label>
          <input matInput formControlName="code" maxlength="20">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Sucursal</mat-label>
          <mat-select formControlName="branchSalesId">
            @for (b of data.sucursales; track b.id) {
            <mat-option [value]="b.id">{{ b.description }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" maxlength="100">
        </mat-form-field>
        <div class="full toggles">
          <mat-slide-toggle formControlName="isDefault">Almacén por defecto de la sucursal</mat-slide-toggle>
          <mat-slide-toggle formControlName="isActive">Activo</mat-slide-toggle>
        </div>
        <p class="full nota">El almacén por defecto es el que se propone al registrar compras y movimientos de esa sucursal.</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-flat-button color="primary" (click)="grabar()" [disabled]="form.invalid || guardando">
        {{ guardando ? 'Grabando...' : 'Grabar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; min-width: 460px; }
    .full { grid-column: 1 / -1; }
    .toggles { display: flex; gap: 24px; flex-wrap: wrap; padding-bottom: 8px; }
    .nota { margin: 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .error { margin-bottom: 12px; padding: 10px 12px; border-radius: 8px; color: var(--mat-sys-error);
      background: color-mix(in srgb, var(--mat-sys-error) 12%, transparent); }
    @media (max-width: 560px) { .grid { grid-template-columns: 1fr; min-width: 0; } }
  `]
})
export class DialogAlmacenComponent {
  readonly data = inject<{ almacen: IWarehouse | null; sucursales: IBranchOption[] }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogAlmacenComponent>);
  private inventarioService = inject(InventarioService);
  private fb = inject(FormBuilder);

  guardando = false;
  error = '';

  form = this.fb.group({
    code: [this.data.almacen?.code ?? '', [Validators.required, Validators.maxLength(20)]],
    branchSalesId: [this.data.almacen?.branchSalesId ?? this.data.sucursales[0]?.id ?? null, Validators.required],
    name: [this.data.almacen?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    isDefault: [this.data.almacen?.isDefault ?? false],
    isActive: [this.data.almacen?.isActive ?? true],
  });

  grabar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req = {
      code: (v.code ?? '').trim(),
      branchSalesId: Number(v.branchSalesId),
      name: (v.name ?? '').trim(),
      isDefault: !!v.isDefault,
      isActive: !!v.isActive,
    };
    this.guardando = true;
    this.error = '';
    const request$ = this.data.almacen
      ? this.inventarioService.actualizarAlmacen(this.data.almacen.id, req)
      : this.inventarioService.crearAlmacen(req);
    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.guardando = false;
        this.error = mensajeError(err, 'No se pudo grabar el almacén.');
      }
    });
  }
}
