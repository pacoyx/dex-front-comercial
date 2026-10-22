import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../../recepcion/components/dialog-question/dialog-question.component';
import { ScheduledEmailNotificationsService } from '../../../services/scheduled-email-notifications.service';
import {
  DAYS_OF_WEEK_OPTIONS,
  ICreateScheduledEmailNotificationRequest,
  IScheduledEmailExecution,
  IScheduledEmailNotification,
  IScheduledEmailRecipient,
  RecipientType,
  ScheduledEmailExecutionStatus,
} from '../../../interfaces/IScheduledEmailNotification';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { DialogAddRecipientComponent } from './components/dialog-add-recipient/dialog-add-recipient.component';
import { DialogSendTestComponent } from './components/dialog-send-test/dialog-send-test.component';
import { DialogPreviewComponent } from './components/dialog-preview/dialog-preview.component';

@Component({
  selector: 'app-scheduled-email-notification-form',
  standalone: true,
  imports: [
    MatButtonModule, MatButtonToggleModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSlideToggleModule, MatTableModule, MatTooltipModule, RouterModule, FormsModule,
    LoadingComponent, DatePipe,
  ],
  templateUrl: './scheduled-email-notification-form.component.html',
  styleUrl: './scheduled-email-notification-form.component.css'
})
export class ScheduledEmailNotificationFormComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scheduledEmailService = inject(ScheduledEmailNotificationsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  readonly diasSemana = DAYS_OF_WEEK_OPTIONS;
  readonly RecipientType = RecipientType;
  readonly ScheduledEmailExecutionStatus = ScheduledEmailExecutionStatus;

  configId: number | null = null;
  loading = false;
  saving = false;
  validationErrors: string[] = [];

  // detalle completo (solo existe cuando !esNuevo)
  detalle: IScheduledEmailNotification | null = null;
  historial: IScheduledEmailExecution[] = [];
  loadingHistorial = false;

  // campos editables del formulario
  code = '';
  name = '';
  hour = 6;
  minute = 0;
  daysOfWeek: number[] = [];
  subjectTemplate = '';
  bodyTemplate = '';
  driverName = '';
  driverDocument = '';
  signatureName = '';
  signaturePosition = '';
  signaturePhone = '';

  togglingEnabled = false;
  ejecutandoAhora = false;

  get esNuevo(): boolean {
    return this.configId === null;
  }

  get titulo(): string {
    return this.esNuevo ? 'Nueva Programación de Correo' : 'Editar Programación de Correo';
  }

  get horaMinutoStr(): string {
    return `${this.hour.toString().padStart(2, '0')}:${this.minute.toString().padStart(2, '0')}`;
  }

  set horaMinutoStr(value: string) {
    const [h, m] = value.split(':').map(v => parseInt(v, 10));
    if (!isNaN(h)) this.hour = h;
    if (!isNaN(m)) this.minute = m;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.configId = Number(idParam);
      this.cargarDetalle(this.configId);
    }
  }

  private cargarDetalle(id: number): void {
    this.loading = true;
    this.scheduledEmailService.obtenerPorId(id).subscribe({
      next: (resp) => {
        this.detalle = resp.data;
        this.asignarCamposDesdeDetalle(resp.data);
        this.loading = false;
        this.cargarHistorial(id);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar la programación de correo.'));
      },
    });
  }

  private asignarCamposDesdeDetalle(detalle: IScheduledEmailNotification): void {
    this.code = detalle.code;
    this.name = detalle.name;
    this.hour = detalle.hour;
    this.minute = detalle.minute;
    this.daysOfWeek = [...detalle.daysOfWeek];
    this.subjectTemplate = detalle.subjectTemplate;
    this.bodyTemplate = detalle.bodyTemplate;
    this.driverName = detalle.driverName;
    this.driverDocument = detalle.driverDocument;
    this.signatureName = detalle.signatureName ?? '';
    this.signaturePosition = detalle.signaturePosition ?? '';
    this.signaturePhone = detalle.signaturePhone ?? '';
  }

  private cargarHistorial(id: number): void {
    this.loadingHistorial = true;
    this.scheduledEmailService.historialEjecuciones(id).subscribe({
      next: (resp) => {
        this.historial = resp.data ?? [];
        this.loadingHistorial = false;
      },
      error: () => {
        this.loadingHistorial = false;
      },
    });
  }

  private construirRequest(): ICreateScheduledEmailNotificationRequest {
    return {
      code: this.code.trim(),
      name: this.name.trim(),
      hour: this.hour,
      minute: this.minute,
      daysOfWeek: this.daysOfWeek,
      subjectTemplate: this.subjectTemplate,
      bodyTemplate: this.bodyTemplate,
      driverName: this.driverName.trim(),
      driverDocument: this.driverDocument.trim(),
      signatureName: this.signatureName.trim() || null,
      signaturePosition: this.signaturePosition.trim() || null,
      signaturePhone: this.signaturePhone.trim() || null,
    };
  }

  private validarCamposBasicos(): boolean {
    if (this.esNuevo && !this.code.trim()) {
      this.notificationService.showError('El código es obligatorio.');
      return false;
    }
    if (!this.name.trim()) {
      this.notificationService.showError('El nombre es obligatorio.');
      return false;
    }
    if (this.daysOfWeek.length === 0) {
      this.notificationService.showError('Selecciona al menos un día de la semana.');
      return false;
    }
    if (!this.subjectTemplate.trim() || !this.bodyTemplate.trim()) {
      this.notificationService.showError('El asunto y el cuerpo del correo son obligatorios.');
      return false;
    }
    if (!this.driverName.trim() || !this.driverDocument.trim()) {
      this.notificationService.showError('El nombre y DNI del chofer son obligatorios.');
      return false;
    }
    return true;
  }

  guardar(): void {
    this.validationErrors = [];
    if (!this.validarCamposBasicos()) return;

    this.saving = true;

    if (this.esNuevo) {
      this.scheduledEmailService.crear(this.construirRequest()).subscribe({
        next: (resp) => {
          this.saving = false;
          this.notificationService.showSuccess('Programación creada correctamente. Ahora agrega destinatarios para poder activarla.');
          this.router.navigate(['/management/correosProgramados', resp.data.id]);
        },
        error: (err) => this.manejarErrorGuardado(err),
      });
    } else {
      const { code, ...req } = this.construirRequest();
      this.scheduledEmailService.actualizar(this.configId!, req).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.showSuccess('Programación actualizada correctamente.');
          this.cargarDetalle(this.configId!);
        },
        error: (err) => this.manejarErrorGuardado(err),
      });
    }
  }

  private manejarErrorGuardado(err: unknown): void {
    this.saving = false;
    const validation = extractValidationErrors(err);
    if (validation.length > 0) {
      this.validationErrors = validation;
    } else {
      this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al guardar la programación.'));
    }
  }

  cancelar(): void {
    this.router.navigate(['/management/correosProgramados']);
  }

  toggleHabilitado(): void {
    if (!this.detalle || this.togglingEnabled) return;

    this.togglingEnabled = true;
    const accion = this.detalle.isEnabled
      ? this.scheduledEmailService.deshabilitar(this.configId!)
      : this.scheduledEmailService.habilitar(this.configId!);

    accion.subscribe({
      next: (resp) => {
        this.togglingEnabled = false;
        this.detalle = resp.data;
        this.notificationService.showSuccess(resp.data.isEnabled ? 'Programación activada.' : 'Programación desactivada.');
      },
      error: (err) => {
        this.togglingEnabled = false;
        const validation = extractValidationErrors(err);
        this.notificationService.showError(validation[0] || extractErrorMessage(err, 'No se pudo cambiar el estado de la programación.'));
      },
    });
  }

  agregarDestinatario(): void {
    if (!this.configId) return;
    this.dialog.open(DialogAddRecipientComponent).afterClosed().subscribe(result => {
      if (!result) return;
      this.scheduledEmailService.agregarDestinatario(this.configId!, result).subscribe({
        next: () => {
          this.notificationService.showSuccess('Destinatario agregado correctamente.');
          this.cargarDetalle(this.configId!);
        },
        error: (err) => {
          const validation = extractValidationErrors(err);
          this.notificationService.showError(validation[0] || extractErrorMessage(err, 'No se pudo agregar el destinatario.'));
        },
      });
    });
  }

  eliminarDestinatario(recipient: IScheduledEmailRecipient): void {
    if (!this.configId) return;
    this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Destinatario',
        message: `¿Está seguro de eliminar "${recipient.email}" de la lista de destinatarios?`,
        msgButton: 'Eliminar',
      },
    }).afterClosed().subscribe(result => {
      if (result !== 'OK') return;
      this.scheduledEmailService.eliminarDestinatario(this.configId!, recipient.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Destinatario eliminado.');
          this.cargarDetalle(this.configId!);
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el destinatario.'));
        },
      });
    });
  }

  vistaPrevia(): void {
    if (!this.configId) return;
    this.scheduledEmailService.vistaPrevia(this.configId).subscribe({
      next: (resp) => {
        this.dialog.open(DialogPreviewComponent, { data: resp.data, width: '600px' });
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la vista previa.'));
      },
    });
  }

  enviarPrueba(): void {
    if (!this.configId) return;
    this.dialog.open(DialogSendTestComponent).afterClosed().subscribe((testEmail: string | undefined) => {
      if (!testEmail) return;
      this.scheduledEmailService.enviarPrueba(this.configId!, testEmail).subscribe({
        next: (resp) => {
          if (resp.success) {
            this.notificationService.showSuccess(resp.message);
          } else {
            this.notificationService.showError(resp.message);
          }
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo enviar el correo de prueba.'));
        },
      });
    });
  }

  ejecutarAhora(): void {
    if (!this.configId || this.ejecutandoAhora) return;
    this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Ejecutar Ahora',
        message: '¿Deseas enviar este correo ya mismo a los destinatarios configurados, sin esperar al horario programado?',
        msgButton: 'Ejecutar',
      },
    }).afterClosed().subscribe(result => {
      if (result !== 'OK') return;
      this.ejecutandoAhora = true;
      this.scheduledEmailService.ejecutarAhora(this.configId!).subscribe({
        next: (resp) => {
          this.ejecutandoAhora = false;
          if (resp.data.status === ScheduledEmailExecutionStatus.Success) {
            this.notificationService.showSuccess(resp.message);
          } else {
            this.notificationService.showError(resp.data.errorMessage || resp.message);
          }
          this.cargarDetalle(this.configId!);
        },
        error: (err) => {
          this.ejecutandoAhora = false;
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo ejecutar el envío.'));
        },
      });
    });
  }

}
