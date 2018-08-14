import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightChainComponent } from './flight-chain.component';

describe('FlightChainComponent', () => {
  let component: FlightChainComponent;
  let fixture: ComponentFixture<FlightChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
