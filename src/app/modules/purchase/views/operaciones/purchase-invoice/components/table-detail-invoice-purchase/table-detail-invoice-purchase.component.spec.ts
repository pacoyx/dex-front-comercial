import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDetailInvoicePurchaseComponent } from './table-detail-invoice-purchase.component';

describe('TableDetailInvoicePurchaseComponent', () => {
  let component: TableDetailInvoicePurchaseComponent;
  let fixture: ComponentFixture<TableDetailInvoicePurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDetailInvoicePurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDetailInvoicePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
