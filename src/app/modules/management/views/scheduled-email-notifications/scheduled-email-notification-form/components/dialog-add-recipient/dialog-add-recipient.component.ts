import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { IAddScheduledEmailRecipientRequest, RecipientType } from '../../../../../interfaces/IScheduledEmailNotification';

@Component({
  selector: 'app-dialog-add-recipient',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatRadioModule, FormsModule],
  templateUrl: './dialog-add-recipient.component.html',
  styleUrl: './dialog-add-recipient.component.css'
})
export class DialogAddRecipientComponent {

  readonly dialogRef = inject(MatDialogRef<DialogAddRecipientComponent>);

  email = '';
  recipientType: RecipientType = RecipientType.To;

  readonly RecipientType = RecipientType;

  get esValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  agregar(): void {
    if (!this.esValido) return;
    const req: IAddScheduledEmailRecipientRequest = {
      email: this.email.trim(),
      recipientType: this.recipientType,
    };
    this.dialogRef.close(req);
  }

}
