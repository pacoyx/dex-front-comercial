import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { ExpenseCategoriesService } from '../../services/expense-categories.service';
import { IExpenseCategory } from '../../interfaces/IExpenseCategory';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogExpenseCategoryComponent } from './components/dialog-expense-category/dialog-expense-category.component';

@Component({
  selector: 'app-expense-categories',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, LoadingComponent, DatePipe],
  templateUrl: './expense-categories.component.html',
  styleUrl: './expense-categories.component.css'
})
export class ExpenseCategoriesComponent implements OnInit {

  private categoriesService = inject(ExpenseCategoriesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  categorias: IExpenseCategory[] = [];
  loading = false;

  displayedColumns: string[] = ['name', 'status', 'createdAt', 'operaciones'];

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.categoriesService.listar().subscribe({
      next: (resp) => {
        this.categorias = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las categorías de gasto.'));
      },
    });
  }

  nuevaCategoria(): void {
    const dialogRef = this.dialog.open(DialogExpenseCategoryComponent, {
      data: { esNuevo: true, objCategoria: null },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCategorias();
      }
    });
  }

  editarCategoria(categoria: IExpenseCategory): void {
    const dialogRef = this.dialog.open(DialogExpenseCategoryComponent, {
      data: { esNuevo: false, objCategoria: categoria },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCategorias();
      }
    });
  }

}
