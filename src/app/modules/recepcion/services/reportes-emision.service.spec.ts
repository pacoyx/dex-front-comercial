import { TestBed } from '@angular/core/testing';

import { ReportesEmisionService } from './reportes-emision.service';

describe('ReportesEmisionService', () => {
  let service: ReportesEmisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportesEmisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
