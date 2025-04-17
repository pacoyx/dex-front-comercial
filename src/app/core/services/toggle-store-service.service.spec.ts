import { TestBed } from '@angular/core/testing';

import { ToggleStoreServiceService } from './toggle-store-service.service';

describe('ToggleStoreServiceService', () => {
  let service: ToggleStoreServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleStoreServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
