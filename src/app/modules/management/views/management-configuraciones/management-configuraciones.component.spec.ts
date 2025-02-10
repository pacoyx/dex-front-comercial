import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementConfiguracionesComponent } from './management-configuraciones.component';

describe('ManagementConfiguracionesComponent', () => {
  let component: ManagementConfiguracionesComponent;
  let fixture: ComponentFixture<ManagementConfiguracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementConfiguracionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementConfiguracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
