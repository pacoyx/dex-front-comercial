import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormRegClienteComponent } from './dialog-form-reg-cliente.component';

describe('DialogFormRegClienteComponent', () => {
  let component: DialogFormRegClienteComponent;
  let fixture: ComponentFixture<DialogFormRegClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormRegClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormRegClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
