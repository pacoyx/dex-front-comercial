import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonsheetPagosComponent } from './buttonsheet-pagos.component';

describe('ButtonsheetPagosComponent', () => {
  let component: ButtonsheetPagosComponent;
  let fixture: ComponentFixture<ButtonsheetPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonsheetPagosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonsheetPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
