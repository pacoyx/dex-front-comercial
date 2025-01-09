import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-msg',
  standalone: true,
  imports: [MatDialogContent, MatDialogClose, MatButtonModule],
  templateUrl: './dialog-msg.component.html',
  styleUrl: './dialog-msg.component.css'
})
export class DialogMsgComponent {
  readonly data = inject<{ title: string, msg: string, err: boolean, wordKey: string , imprimir:boolean}>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogMsgComponent>);
  

  constructor() {
    if (this.data.err === undefined) {
      this.data.err = false;
    }
  }

  imprimirTicket() {    
    this.dialogRef.close('Imprimir');
  }

}
