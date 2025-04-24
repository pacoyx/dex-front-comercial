import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-notifications',
  standalone: true,
  imports: [MatDialogContent, MatDialogClose, MatButtonModule],
  templateUrl: './dialog-notifications.component.html',
  styleUrl: './dialog-notifications.component.css'
})
export class DialogNotificationsComponent {
  readonly data = inject<{ title: string, msg: string, err: boolean, wordKey: string, imprimir: boolean }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogNotificationsComponent>);


  constructor() {
    if (this.data.err === undefined) {
      this.data.err = false;
    }
  }

  imprimirTicket() {
    this.dialogRef.close('Imprimir');
  }
}
