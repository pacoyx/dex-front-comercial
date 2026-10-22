import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-send-test',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './dialog-send-test.component.html',
  styleUrl: './dialog-send-test.component.css'
})
export class DialogSendTestComponent {

  readonly dialogRef = inject(MatDialogRef<DialogSendTestComponent>);

  testEmail = '';

  get esValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.testEmail.trim());
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    if (!this.esValido) return;
    this.dialogRef.close(this.testEmail.trim());
  }

}
