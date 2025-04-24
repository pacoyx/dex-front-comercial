import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddItemInvoicePurchaseComponent } from './dialog-add-item-invoice-purchase.component';

describe('DialogAddItemInvoicePurchaseComponent', () => {
  let component: DialogAddItemInvoicePurchaseComponent;
  let fixture: ComponentFixture<DialogAddItemInvoicePurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddItemInvoicePurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddItemInvoicePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
