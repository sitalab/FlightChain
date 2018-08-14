import { TestBed, inject } from '@angular/core/testing';

import { FlightChainService } from './flight-chain.service';

describe('FlightChainService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightChainService]
    });
  });

  it('should be created', inject([FlightChainService], (service: FlightChainService) => {
    expect(service).toBeTruthy();
  }));
});
