import { TestBed } from '@angular/core/testing';

import { PurchaseInvoiceStoreService } from './purchase-invoice-store.service';

describe('PurchaseInvoiceStoreService', () => {
  let service: PurchaseInvoiceStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseInvoiceStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
