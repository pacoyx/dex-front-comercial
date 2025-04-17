import { TestBed } from '@angular/core/testing';

import { PurchaseSettingServiceService } from './purchase-setting-service.service';

describe('PurchaseSettingServiceService', () => {
  let service: PurchaseSettingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseSettingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
