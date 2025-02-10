import { TestBed } from '@angular/core/testing';

import { ManagentSystemService } from './managent-system.service';

describe('ManagentSystemService', () => {
  let service: ManagentSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagentSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
