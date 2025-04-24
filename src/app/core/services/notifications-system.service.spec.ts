import { TestBed } from '@angular/core/testing';

import { NotificationsSystemService } from './notifications-system.service';

describe('NotificationsSystemService', () => {
  let service: NotificationsSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
