import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-question',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './dialog-question.component.html',
  styleUrl: './dialog-question.component.css'
})
export class DialogQuestionComponent {
  readonly dialogRef = inject(MatDialogRef<DialogQuestionComponent>);
  readonly data = inject<{ title: string; message: string; msgButton:string }>(MAT_DIALOG_DATA);
  constructor() {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOk(): void {
    this.dialogRef.close("OK");
  }

}
