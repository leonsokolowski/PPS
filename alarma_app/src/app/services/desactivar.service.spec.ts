import { TestBed } from '@angular/core/testing';

import { DesactivarService } from './desactivar.service';

describe('DesactivarService', () => {
  let service: DesactivarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesactivarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
