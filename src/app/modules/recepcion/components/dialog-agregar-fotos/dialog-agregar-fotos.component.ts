import { Component, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FotoQueueComponent } from '../foto-queue/foto-queue.component';

@Component({
  selector: 'app-dialog-agregar-fotos',
  standalone: true,
  imports: [
    MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    FotoQueueComponent
  ],
  templateUrl: './dialog-agregar-fotos.component.html',
  styleUrl: './dialog-agregar-fotos.component.css'
})
export class DialogAgregarFotosComponent {

  readonly dialogRef = inject(MatDialogRef<DialogAgregarFotosComponent>);
  readonly data = inject<{ workGuideId: number }>(MAT_DIALOG_DATA);

  @ViewChild(FotoQueueComponent) fotoQueue!: FotoQueueComponent;

  cerrar(): void {
    this.dialogRef.close({ subidas: this.fotoQueue?.subidas ?? 0 });
  }
}
