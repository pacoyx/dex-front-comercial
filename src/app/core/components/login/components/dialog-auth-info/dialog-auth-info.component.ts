import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

export interface IDialogAuthInfoData {
  icon: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-dialog-auth-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogActions, MatDialogTitle, MatDialogContent],
  templateUrl: './dialog-auth-info.component.html',
  styleUrl: './dialog-auth-info.component.css'
})
export class DialogAuthInfoComponent {

  readonly data = inject<IDialogAuthInfoData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DialogAuthInfoComponent>);

  cerrar(): void {
    this.dialogRef.close();
  }

}
