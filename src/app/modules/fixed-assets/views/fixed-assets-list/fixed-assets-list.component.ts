import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogosService } from '../../../facturacion/services/catalogos.service';
import { IBranchSales } from '../../../facturacion/interfaces/ICatalogos';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { FixedAssetsService } from '../../services/fixed-assets.service';
import { IFixedAssetCategory, IFixedAssetListItem } from '../../interfaces/IFixedAsset';
import { FixedAssetStatusColorPipe, FixedAssetStatusLabelPipe } from '../../shared/fixed-asset-status';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogFormFixedAssetComponent } from './components/dialog-form-fixed-asset/dialog-form-fixed-asset.component';

@Component({
  selector: 'app-fixed-assets-list',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatTableModule,
    MatDialogModule, MatTooltipModule, FormsModule, RouterModule, CurrencyPipe, DatePipe,
    FixedAssetStatusLabelPipe, FixedAssetStatusColorPipe,
  ],
  templateUrl: './fixed-assets-list.component.html',
  styleUrl: './fixed-assets-list.component.css'
})
export class FixedAssetsListComponent implements OnInit {

  private fixedAssetsService = inject(FixedAssetsService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  branches: IBranchSales[] = [];
  categories: IFixedAssetCategory[] = [];

  filtroBranchId: number | null = null;
  filtroCategoryId: number | null = null;
  filtroStatus: number | null = null;

  statusOptions = [
    { value: null, label: 'Todos' },
    { value: 1, label: 'Activo' },
    { value: 2, label: 'En Mantenimiento' },
    { value: 3, label: 'De Baja' },
    { value: 4, label: 'Vendido' },
  ];

  displayedColumns: string[] = ['code', 'name', 'category', 'branch', 'responsible', 'status', 'bookValue', 'acciones'];
  dataSource = new MatTableDataSource<IFixedAssetListItem>([]);

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({ next: (resp) => this.branches = resp.data });
    this.fixedAssetsService.listarCategorias().subscribe({ next: (resp) => this.categories = resp.data });
    this.buscar();
  }

  buscar(): void {
    this.fixedAssetsService.listar({
      branchId: this.filtroBranchId ?? undefined,
      categoryId: this.filtroCategoryId ?? undefined,
      status: this.filtroStatus ?? undefined,
    }).subscribe({
      next: (resp) => this.dataSource.data = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los activos fijos.')),
    });
  }

  limpiar(): void {
    this.filtroBranchId = null;
    this.filtroCategoryId = null;
    this.filtroStatus = null;
    this.buscar();
  }

  nuevo(): void {
    this.dialog.open(DialogFormFixedAssetComponent, {
      width: '560px',
      data: { branches: this.branches, categories: this.categories },
    }).afterClosed().subscribe(result => {
      if (result) this.buscar();
    });
  }

  verFicha(asset: IFixedAssetListItem): void {
    this.router.navigate(['/fixed-assets', asset.id]);
  }

}
