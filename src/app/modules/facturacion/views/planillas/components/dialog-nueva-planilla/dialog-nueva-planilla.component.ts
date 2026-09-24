import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogosService } from '../../../../services/catalogos.service';
import { CollectionSheetsService } from '../../../../services/collection-sheets.service';
import { IBranchSales } from '../../../../interfaces/ICatalogos';
import { extractErrorMessage } from '../../../../shared/http-error.util';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';

@Component({
  selector: 'app-dialog-nueva-planilla',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatButtonModule, MatIconModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './dialog-nueva-planilla.component.html',
  styleUrl: './dialog-nueva-planilla.component.css'
})
export class DialogNuevaPlanillaComponent implements OnInit {
  catalogosService = inject(CatalogosService);
  collectionSheetsService = inject(CollectionSheetsService);
  notificationService = inject(NotificationsSystemService);

  branches: IBranchSales[] = [];
  frmPlanilla: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogNuevaPlanillaComponent>,
  ) {
    this.frmPlanilla = this.fb.group({
      branchId: [null, Validators.required],
      number: ['', Validators.required],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (response) => this.branches = response.data,
      error: () => this.notificationService.showError('No se pudieron cargar las sucursales.')
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (this.frmPlanilla.invalid) {
      this.notificationService.showError('Debe completar todos los campos obligatorios.');
      return;
    }

    this.saving = true;
    this.collectionSheetsService.crearPlanilla(this.frmPlanilla.value).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.showSuccess('Planilla registrada correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar la planilla.'));
      }
    });
  }

}
