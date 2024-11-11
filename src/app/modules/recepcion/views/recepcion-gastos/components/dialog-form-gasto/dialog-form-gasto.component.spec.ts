import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormGastoComponent } from './dialog-form-gasto.component';

describe('DialogFormGastoComponent', () => {
  let component: DialogFormGastoComponent;
  let fixture: ComponentFixture<DialogFormGastoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormGastoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
