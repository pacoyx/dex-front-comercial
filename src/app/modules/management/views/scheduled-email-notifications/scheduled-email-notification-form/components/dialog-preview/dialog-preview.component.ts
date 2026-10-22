import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IScheduledEmailPreview } from '../../../../../interfaces/IScheduledEmailNotification';

@Component({
  selector: 'app-dialog-preview',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './dialog-preview.component.html',
  styleUrl: './dialog-preview.component.css'
})
export class DialogPreviewComponent {

  readonly data = inject<IScheduledEmailPreview>(MAT_DIALOG_DATA);

}
