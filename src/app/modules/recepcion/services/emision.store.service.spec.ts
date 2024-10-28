import { TestBed } from '@angular/core/testing';

import { EmisionStoreService } from './emision.store.service';

describe('EmisionStoreService', () => {
  let service: EmisionStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmisionStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
