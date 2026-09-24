import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../../../services/employees.service';
import { CatalogosService } from '../../../../../services/catalogos.service';
import { IDocumentType } from '../../../../../interfaces/ICatalogos';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-documento',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule,
  ],
  templateUrl: './dialog-documento.component.html',
  styleUrl: './dialog-documento.component.css'
})
export class DialogDocumentoComponent implements OnInit {

  readonly data = inject<{ employeeId: number }>(MAT_DIALOG_DATA);
  private employeesService = inject(EmployeesService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  tiposDocumento: IDocumentType[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogDocumentoComponent>,
  ) {
    this.form = this.fb.group({
      documentTypeId: [null, Validators.required],
      fileName: ['', Validators.required],
      blobUrl: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.catalogosService.listarTiposDocumento().subscribe({ next: (r) => this.tiposDocumento = r.data });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    this.employeesService.agregarDocumento(this.data.employeeId, {
      documentTypeId: value.documentTypeId,
      fileName: value.fileName,
      blobUrl: value.blobUrl,
      notes: value.notes || null,
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Documento agregado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo agregar el documento.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
