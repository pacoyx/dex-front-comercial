import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagentEmpresaComponent } from './managent-empresa.component';

describe('ManagentEmpresaComponent', () => {
  let component: ManagentEmpresaComponent;
  let fixture: ComponentFixture<ManagentEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagentEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagentEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
