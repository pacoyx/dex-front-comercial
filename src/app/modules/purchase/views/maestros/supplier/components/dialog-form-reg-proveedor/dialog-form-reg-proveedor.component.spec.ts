import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormRegProveedorComponent } from './dialog-form-reg-proveedor.component';

describe('DialogFormRegProveedorComponent', () => {
  let component: DialogFormRegProveedorComponent;
  let fixture: ComponentFixture<DialogFormRegProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormRegProveedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormRegProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
