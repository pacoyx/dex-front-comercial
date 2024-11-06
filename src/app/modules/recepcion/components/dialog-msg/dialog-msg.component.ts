import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-msg',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatIcon],
  templateUrl: './dialog-msg.component.html',
  styleUrl: './dialog-msg.component.css'
})
export class DialogMsgComponent {
  readonly data = inject<{ title: string, msg: string, err: boolean }>(MAT_DIALOG_DATA);
  
  constructor() {
    if (this.data.err === undefined) {
      this.data.err = false;
    }
  }
  

}
