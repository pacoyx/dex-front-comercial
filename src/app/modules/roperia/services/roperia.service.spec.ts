import { TestBed } from '@angular/core/testing';

import { RoperiaService } from './roperia.service';

describe('RoperiaService', () => {
  let service: RoperiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoperiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
