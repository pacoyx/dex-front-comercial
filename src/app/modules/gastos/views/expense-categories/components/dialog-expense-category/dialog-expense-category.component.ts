import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { ExpenseCategoriesService } from '../../../../services/expense-categories.service';
import { IExpenseCategory } from '../../../../interfaces/IExpenseCategory';
import { extractErrorMessage } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-expense-category',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-expense-category.component.html',
  styleUrl: './dialog-expense-category.component.css'
})
export class DialogExpenseCategoryComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; objCategoria: IExpenseCategory | null }>(MAT_DIALOG_DATA);
  private categoriesService = inject(ExpenseCategoriesService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Nueva Categoría de Gasto' : 'Editar Categoría de Gasto';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogExpenseCategoryComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.objCategoria) {
      this.form.patchValue(this.data.objCategoria);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.categoriesService.crear({ name: this.form.value.name })
      : this.categoriesService.actualizar(this.data.objCategoria!.id, this.form.value);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp.success);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la categoría.'));
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
