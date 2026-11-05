import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import { MaestrosService } from '../../../../../services/maestros.service';
import { IResponseProdServices } from '../../../../../interfaces/IProdServices';
import { IServiceAccessFastAdmin } from '../../../../../interfaces/IServiceAccessFast';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-access-fast',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogActions,
    MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-access-fast.component.html',
  styleUrl: './dialog-form-access-fast.component.css'
})
export class DialogFormAccessFastComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; item: IServiceAccessFastAdmin | null }>(MAT_DIALOG_DATA);
  private maestrosService = inject(MaestrosService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Nuevo Acceso Rápido' : 'Editar Acceso Rápido';
  productos: IResponseProdServices[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormAccessFastComponent>,
  ) {
    this.form = this.fb.group({
      prodServiceId: [null as number | null, Validators.required],
      shortName: ['', Validators.required],
      iconName: ['bolt', Validators.required],
      status: ['A', Validators.required],
    });
  }

  ngOnInit(): void {
    this.maestrosService.obtenerProdServices(1, 1000).subscribe({
      next: (resp) => {
        this.productos = (resp.data?.servicios ?? []).filter((p) => p.status === 'A');
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el listado de servicios.'));
      }
    });

    if (!this.data.esNuevo && this.data.item) {
      this.form.patchValue({
        prodServiceId: this.data.item.prodServiceId,
        shortName: this.data.item.shortName,
        iconName: this.data.item.iconName,
        status: this.data.item.status,
      });
    }
  }

  onSubmit(): void {
    if (this.loadingSave) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showError('Completa el servicio y el nombre corto antes de guardar.');
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    const req = {
      prodServiceId: value.prodServiceId,
      shortName: value.shortName,
      iconName: value.iconName,
      status: value.status,
    };

    const request$ = this.data.esNuevo
      ? this.maestrosService.crearAccesoRapido(req)
      : this.maestrosService.actualizarAccesoRapido(this.data.item!.id, req);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Acceso rápido creado correctamente.' : 'Acceso rápido actualizado correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el acceso rápido.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
