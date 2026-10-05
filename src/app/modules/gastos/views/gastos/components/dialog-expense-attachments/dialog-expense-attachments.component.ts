import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { ExpensesService } from '../../../../services/expenses.service';
import { IExpenseAttachment } from '../../../../interfaces/IExpenseAttachment';
import { extractErrorMessage } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-expense-attachments',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, DatePipe,
  ],
  templateUrl: './dialog-expense-attachments.component.html',
  styleUrl: './dialog-expense-attachments.component.css'
})
export class DialogExpenseAttachmentsComponent implements OnInit {

  readonly data = inject<{ expenseId: number }>(MAT_DIALOG_DATA);
  private expensesService = inject(ExpensesService);
  private notificationService = inject(NotificationsSystemService);

  attachments: IExpenseAttachment[] = [];
  loading = false;
  loadingSave = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogExpenseAttachmentsComponent>,
  ) {
    this.form = this.fb.group({
      fileName: ['', Validators.required],
      originalFileName: ['', Validators.required],
      blobUrl: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarAdjuntos();
  }

  cargarAdjuntos(): void {
    this.loading = true;
    this.expensesService.listarAdjuntos(this.data.expenseId).subscribe({
      next: (resp) => {
        this.attachments = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los adjuntos.'));
      },
    });
  }

  agregar(): void {
    if (this.form.invalid) {
      return;
    }

    this.loadingSave = true;
    this.expensesService.crearAdjunto(this.data.expenseId, this.form.value).subscribe({
      next: () => {
        this.loadingSave = false;
        this.form.reset();
        this.cargarAdjuntos();
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar el adjunto.'));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
