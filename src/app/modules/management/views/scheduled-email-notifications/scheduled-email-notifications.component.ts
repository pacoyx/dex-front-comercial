import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { ScheduledEmailNotificationsService } from '../../services/scheduled-email-notifications.service';
import { IScheduledEmailNotificationSummary, ScheduledEmailRecipientMode } from '../../interfaces/IScheduledEmailNotification';
import { formatScheduleText } from '../../shared/schedule-format.util';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-scheduled-email-notifications',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTooltipModule, RouterModule, LoadingComponent, DatePipe],
  templateUrl: './scheduled-email-notifications.component.html',
  styleUrl: './scheduled-email-notifications.component.css'
})
export class ScheduledEmailNotificationsComponent implements OnInit {

  private scheduledEmailService = inject(ScheduledEmailNotificationsService);
  private notificationService = inject(NotificationsSystemService);

  readonly ScheduledEmailRecipientMode = ScheduledEmailRecipientMode;

  configuraciones: IScheduledEmailNotificationSummary[] = [];
  loading = false;

  displayedColumns: string[] = ['name', 'recipientMode', 'horario', 'isEnabled', 'recipientsCount', 'lastExecutionAt', 'nextExecutionAt', 'operaciones'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.scheduledEmailService.listar().subscribe({
      next: (resp) => {
        this.configuraciones = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los correos programados.'));
      },
    });
  }

  horario(config: IScheduledEmailNotificationSummary): string {
    return formatScheduleText(config.hour, config.minute, config.daysOfWeek);
  }

}
