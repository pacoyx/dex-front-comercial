import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { EmailAccountsService } from '../../../../services/email-accounts.service';
import { EMAIL_ACCOUNT_OPERATIONS, IEmailAccount } from '../../../../interfaces/IEmailAccount';

@Component({
  selector: 'app-dialog-email-account',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-email-account.component.html',
  styleUrl: './dialog-email-account.component.css'
})
export class DialogEmailAccountComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; objCuenta: IEmailAccount | null }>(MAT_DIALOG_DATA);
  private emailAccountsService = inject(EmailAccountsService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Nueva Cuenta de Correo' : 'Editar Cuenta de Correo';
  operaciones = EMAIL_ACCOUNT_OPERATIONS;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogEmailAccountComponent>,
  ) {
    this.form = this.fb.group({
      operacion: ['', Validators.required],
      host: ['', [Validators.required, Validators.maxLength(200)]],
      port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      userName: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      password: ['', this.data.esNuevo ? [Validators.required] : []],
      enableSsl: [true],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.objCuenta) {
      this.form.patchValue({
        operacion: this.data.objCuenta.operacion,
        host: this.data.objCuenta.host,
        port: this.data.objCuenta.port,
        userName: this.data.objCuenta.userName,
        enableSsl: this.data.objCuenta.enableSsl,
        isActive: this.data.objCuenta.isActive,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loadingSave = true;
    const formValue = this.form.value;

    const request$ = this.data.esNuevo
      ? this.emailAccountsService.crearCuenta({
        operacion: formValue.operacion,
        provider: 'Smtp',
        host: formValue.host,
        port: formValue.port,
        userName: formValue.userName,
        password: formValue.password,
        enableSsl: formValue.enableSsl,
      })
      : this.emailAccountsService.actualizarCuenta(this.data.objCuenta!.id, {
        operacion: formValue.operacion,
        provider: 'Smtp',
        host: formValue.host,
        port: formValue.port,
        userName: formValue.userName,
        password: formValue.password ? formValue.password : null,
        enableSsl: formValue.enableSsl,
        isActive: formValue.isActive,
      });

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp.success);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(err?.message || 'No se pudo guardar la cuenta de correo.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
