import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormRegProdServiceComponent } from './dialog-form-reg-prod-service.component';

describe('DialogFormRegProdServiceComponent', () => {
  let component: DialogFormRegProdServiceComponent;
  let fixture: ComponentFixture<DialogFormRegProdServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormRegProdServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormRegProdServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
