import { Component, inject, OnInit } from '@angular/core';
import { ManagentSystemService } from '../../services/managent-system.service';
import { IGetCompanyByUserResponse } from '../../interfaces/ICompany';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILoginResponseData } from '../../../../core/interfaces/ILoginResponse';

@Component({
  selector: 'app-managent-empresa',
  standalone: true,
  imports: [
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatIconModule, MatSelectModule, ReactiveFormsModule
  ],
  templateUrl: './managent-empresa.component.html',
  styleUrl: './managent-empresa.component.css'
})
export class ManagentEmpresaComponent implements OnInit {

  managementService = inject(ManagentSystemService)
  dataCompany!: IGetCompanyByUserResponse;
  loading = false;
  formCompany: FormGroup;
  idUser = 1;
  hasData = false;
  showMsgSuccess = false;
  showMsgError = false;

  constructor() {
    this.formCompany = new FormGroup({
      id: new FormControl({ value: 0, disabled: true }),
      nameComercial: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      address: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      website: new FormControl(''),
      nameCompany: new FormControl(''),
      documentType: new FormControl('DNI'),
      numberType: new FormControl(''),
      logo: new FormControl(''),
      facebook: new FormControl(''),
      twitter: new FormControl(''),
      instagram: new FormControl(''),
      status: new FormControl('A'),
      usuarioId: new FormControl('', [Validators.required])
    });


  }
  ngOnInit(): void {
    this.getIdUser();
    this.getDataCompany();
  }

  getIdUser() {
    const storedData = localStorage.getItem('dex24Auth');
    const parsedData: ILoginResponseData = storedData ? JSON.parse(storedData) : null;
    this.idUser = parsedData.userId;
    return this.idUser;
  }

  getDataCompany() {
    this.loading = true;
    this.managementService.obtenerEmpresaPorUsuario(1).subscribe({
      next: (resp) => {
        this.loading = false;
        this.hasData = resp.success;
        if (resp.success) {
          if (resp.data) {
            this.dataCompany = resp.data;
            this.setDataCompany();
          }
        }
        else {
          this.nuevo();
        }
      },
      error: error => {
        console.error('There was an error!', error);
        this.loading = false;
      }
    })
  }

  showMessage() {
    this.showMsgSuccess = true;
    setTimeout(() => {
      this.showMsgSuccess = false;
    }, 3000);
  }

  setDataCompany() {
    this.formCompany.get('id')?.setValue(this.dataCompany.id);
    this.formCompany.get('nameComercial')?.setValue(this.dataCompany.nameComercial);
    this.formCompany.get('description')?.setValue(this.dataCompany.description);
    this.formCompany.get('address')?.setValue(this.dataCompany.address);
    this.formCompany.get('email')?.setValue(this.dataCompany.email);
    this.formCompany.get('phone')?.setValue(this.dataCompany.phone);
    this.formCompany.get('website')?.setValue(this.dataCompany.webSite);
    this.formCompany.get('nameCompany')?.setValue(this.dataCompany.nameCompany);
    this.formCompany.get('documentType')?.setValue(this.dataCompany.documentType);
    this.formCompany.get('numberType')?.setValue(this.dataCompany.numberType);
    this.formCompany.get('logo')?.setValue(this.dataCompany.logo);
    this.formCompany.get('facebook')?.setValue(this.dataCompany.facebook);
    this.formCompany.get('twitter')?.setValue(this.dataCompany.twitter);
    this.formCompany.get('instagram')?.setValue(this.dataCompany.instagram);
    this.formCompany.get('status')?.setValue(this.dataCompany.status);
    this.formCompany.get('usuarioId')?.setValue(this.dataCompany.usuarioId);
  }

  nuevo() {
    this.formCompany.reset();
    this.formCompany.get('id')?.setValue(this.idUser);
    this.formCompany.get('status')?.setValue('A');
  }

  grabar() {
    this.loading = true;
    this.formCompany.get('usuarioId')?.setValue(this.idUser);

    const operation = this.hasData ? this.managementService.actualizarEmpresa(this.formCompany.value) : this.managementService.crearEmpresa(this.formCompany.value);

    operation.subscribe({
      next: (resp) => {
      this.loading = false;
      if (resp.success) {
        this.getDataCompany();
        this.showMessage();
      }
      },
      error: error => {
      console.error('There was an error!', error);
      this.loading = false;
      }
    });
  }

}
