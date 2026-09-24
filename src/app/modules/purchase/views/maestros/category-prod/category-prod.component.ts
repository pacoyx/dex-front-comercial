import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { ICategoryProd } from '../../../interfaces/IMaestros';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogFormRegCategoryProdComponent } from './components/dialog-form-reg-category-prod/dialog-form-reg-category-prod.component';

@Component({
  selector: 'app-category-prod',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './category-prod.component.html',
  styleUrl: './category-prod.component.css'
})
export class CategoryProdComponent implements OnInit {

  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: ICategoryProd[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description', 'status'];
  dataSource = new MatTableDataSource<ICategoryProd>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.purchaseSettingService.listarCategoriasProducto().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las categorías de producto.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.name.toLowerCase().includes(texto));
  }

  nuevaCategoria(): void {
    const dialogRef = this.dialog.open(DialogFormRegCategoryProdComponent, {
      data: { esNuevo: true, objCategoria: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarCategoria(categoria: ICategoryProd): void {
    const dialogRef = this.dialog.open(DialogFormRegCategoryProdComponent, {
      data: { esNuevo: false, objCategoria: categoria }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(categoria: ICategoryProd): void {
    if (categoria.status === 'A') {
      if (!confirm(`Se desactivará la categoría "${categoria.name}". ¿Deseas continuar?`)) {
        return;
      }
      this.purchaseSettingService.eliminarCategoriaProducto(categoria.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Categoría desactivada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar la categoría.'));
        }
      });
    } else {
      this.purchaseSettingService.actualizarCategoriaProducto({ ...categoria, status: 'A' }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Categoría activada correctamente.');
          this.cargar();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar la categoría.'));
        }
      });
    }
  }

}
