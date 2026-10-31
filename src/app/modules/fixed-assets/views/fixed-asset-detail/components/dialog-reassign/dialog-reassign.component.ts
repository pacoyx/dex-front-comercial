import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FixedAssetsService } from '../../../../services/fixed-assets.service';
import { CatalogosService } from '../../../../../facturacion/services/catalogos.service';
import { IBranchSales } from '../../../../../facturacion/interfaces/ICatalogos';
import { ManagentSystemService } from '../../../../../management/services/managent-system.service';
import { IGetUserResponse } from '../../../../../management/interfaces/IUsers';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../../shared/http-error.util';

export interface DialogReassignData {
  assetId: number;
  currentBranchId: number;
}

@Component({
  selector: 'app-dialog-reassign-fixed-asset',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-reassign.component.html',
  styleUrl: './dialog-reassign.component.css',
})
export class DialogReassignFixedAssetComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DialogReassignFixedAssetComponent>);
  readonly data = inject<DialogReassignData>(MAT_DIALOG_DATA);

  private fixedAssetsService = inject(FixedAssetsService);
  private catalogosService = inject(CatalogosService);
  private managentSystemService = inject(ManagentSystemService);
  private notificationService = inject(NotificationsSystemService);

  branches: IBranchSales[] = [];
  usuarios: IGetUserResponse[] = [];
  guardando = false;

  form = new FormGroup({
    newBranchId: new FormControl<number | null>(null, [Validators.required]),
    newResponsibleUserId: new FormControl<number | null>(null),
    reason: new FormControl('', [Validators.maxLength(300)]),
  });

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({ next: (resp) => this.branches = resp.data });
    this.managentSystemService.listarUsuarios().subscribe({ next: (resp) => this.usuarios = resp.data ?? [] });
    this.form.patchValue({ newBranchId: this.data.currentBranchId });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valor = this.form.getRawValue();

    this.fixedAssetsService.reasignar(this.data.assetId, {
      newBranchId: valor.newBranchId!,
      newResponsibleUserId: valor.newResponsibleUserId ?? null,
      reason: valor.reason || undefined,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.showSuccess('Activo fijo reasignado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo reasignar el activo fijo.'));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
