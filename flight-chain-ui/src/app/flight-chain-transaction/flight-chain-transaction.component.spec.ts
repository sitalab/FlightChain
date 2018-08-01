import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightChainTransactionComponent } from './flight-chain-transaction.component';

describe('FlightChainTransactionComponent', () => {
  let component: FlightChainTransactionComponent;
  let fixture: ComponentFixture<FlightChainTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightChainTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightChainTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
