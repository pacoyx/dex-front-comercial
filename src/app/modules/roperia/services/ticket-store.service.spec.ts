import { TestBed } from '@angular/core/testing';

import { TicketStoreService } from './ticket-store.service';

describe('TicketStoreService', () => {
  let service: TicketStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
