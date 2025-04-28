import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceDetailViewComponent } from './purchase-invoice-detail-view.component';

describe('PurchaseInvoiceDetailViewComponent', () => {
  let component: PurchaseInvoiceDetailViewComponent;
  let fixture: ComponentFixture<PurchaseInvoiceDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseInvoiceDetailViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseInvoiceDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
