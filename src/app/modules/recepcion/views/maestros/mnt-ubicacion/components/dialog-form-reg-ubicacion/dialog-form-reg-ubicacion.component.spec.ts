import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormRegUbicacionComponent } from './dialog-form-reg-ubicacion.component';

describe('DialogFormRegUbicacionComponent', () => {
  let component: DialogFormRegUbicacionComponent;
  let fixture: ComponentFixture<DialogFormRegUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormRegUbicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormRegUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
