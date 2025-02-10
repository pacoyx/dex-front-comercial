import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ManagentSystemService } from '../../../../services/managent-system.service';
import { ICreateUserRequest, IUpdateUserRequest } from '../../../../interfaces/IUsers';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule
  ],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.css'
})
export class DialogAddUserComponent {


  readonly data = inject<{ esNuevo: boolean, objUsuario: any }>(MAT_DIALOG_DATA);
  usuarioService = inject(ManagentSystemService);
  userForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Usuario' : 'Actualizar Usuario';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAddUserComponent>,
  ) {

    this.userForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      userName: ['', Validators.required],
      password: [''],
      role: ['', Validators.required],
      email: '',
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userForm.reset();
    if (this.data.esNuevo) {
      this.userForm.patchValue({ status: 'A' });
    } else {
      this.userForm.patchValue(this.data.objUsuario);
      this.userForm.get('password')?.setValue('');
    }
  }


  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    if (this.data.esNuevo) {
      if (this.userForm.get('password')?.value === '') {
        this.userForm.get('password')?.setErrors({ required: true });
        return;
      }
    }


    const usuarioData = this.userForm.value;
    const usuarioDataCreate: ICreateUserRequest = usuarioData;
    const usuarioidataUpdate: IUpdateUserRequest = usuarioData;

    console.log('===>',usuarioData);
    

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.usuarioService.crearUsuario(usuarioDataCreate)
      : this.usuarioService.actualizarUsuario(usuarioidataUpdate);

    request$.subscribe({
      next: (resp: any) => {
        console.log(resp);

        this.loadingSave = false;
        this.dialogRef.close(resp.success);
      },
      error: (err: any) => {
        console.log(err);
        this.loadingSave = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

}
