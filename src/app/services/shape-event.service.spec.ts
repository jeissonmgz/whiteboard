import { TestBed } from '@angular/core/testing';

import { ShapeEventService } from './shape-event.service';

describe('ShapeEventService', () => {
  let service: ShapeEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShapeEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
