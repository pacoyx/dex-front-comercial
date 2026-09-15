import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { CollectionSheetsService } from '../../services/collection-sheets.service';
import { ICollectionSheet } from '../../interfaces/ICollectionSheets';
import { CollectionSheetStatusColorPipe, CollectionSheetStatusLabelPipe } from '../../shared/collection-sheet-status';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogNuevaPlanillaComponent } from './components/dialog-nueva-planilla/dialog-nueva-planilla.component';

@Component({
  selector: 'app-planillas',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule, RouterModule, CurrencyPipe, DatePipe,
    CollectionSheetStatusLabelPipe, CollectionSheetStatusColorPipe
  ],
  templateUrl: './planillas.component.html',
  styleUrl: './planillas.component.css'
})
export class PlanillasComponent implements OnInit {

  private collectionSheetsService = inject(CollectionSheetsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['numero', 'apertura', 'cierre', 'total', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<ICollectionSheet>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.collectionSheetsService.listarPlanillas().subscribe({
      next: (response) => this.dataSource.data = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las planillas.'))
    });
  }

  nuevaPlanilla() {
    const dialogRef = this.dialog.open(DialogNuevaPlanillaComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

}
