import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../../../../../../core/services/notifications-system.service';

export interface IDialogActivationLinkData {
  title: string;
  activationUrl: string;
}

@Component({
  selector: 'app-dialog-activation-link',
  standalone: true,
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './dialog-activation-link.component.html',
  styleUrl: './dialog-activation-link.component.css'
})
export class DialogActivationLinkComponent {
  readonly data = inject<IDialogActivationLinkData>(MAT_DIALOG_DATA);
  private notificationService = inject(NotificationsSystemService);

  constructor(
    private dialogRef: MatDialogRef<DialogActivationLinkComponent>,
  ) { }

  copiar(): void {
    navigator.clipboard.writeText(this.data.activationUrl).then(() => {
      this.notificationService.showSuccess('Link copiado al portapapeles.');
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
