import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { SharedDocumentsService } from '../../services/shared-documents.service';
import { ISharedDocument } from '../../interfaces/ISharedDocument';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogShareDocumentComponent } from './components/dialog-share-document/dialog-share-document.component';

@Component({
  selector: 'app-shared-documents-list',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatTableModule, MatTooltipModule, DatePipe,
  ],
  templateUrl: './shared-documents-list.component.html',
  styleUrl: './shared-documents-list.component.css'
})
export class SharedDocumentsListComponent implements OnInit {

  private sharedDocumentsService = inject(SharedDocumentsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['title', 'category', 'recipients', 'createdAt', 'acciones'];
  dataSource = new MatTableDataSource<ISharedDocument>([]);
  loading = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.sharedDocumentsService.listarCompartidosPorMi().subscribe({
      next: (resp) => {
        this.dataSource.data = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los documentos compartidos.'));
      },
    });
  }

  compartir(): void {
    this.dialog.open(DialogShareDocumentComponent, { width: '520px' }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  verRecipientes(doc: ISharedDocument): string {
    return doc.recipients.map(r => r.userName).join(', ');
  }

  eliminar(doc: ISharedDocument): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Eliminar documento',
        message: `¿Está seguro de eliminar "${doc.title}"? Los usuarios con los que se compartió dejarán de verlo.`,
        msgButton: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.sharedDocumentsService.eliminar(doc.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Documento eliminado correctamente.');
            this.cargar();
          },
          error: (err) => {
            this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el documento.'));
          },
        });
      }
    });
  }

}
