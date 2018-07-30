import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {FlightChainService} from "./flight-chain.service";
import {NGXLogger} from "ngx-logger";
import {AcrisFlight} from "../acris-schema/AcrisFlight";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-flight-chain',
  templateUrl: './flight-chain.component.html',
  styleUrls: ['./flight-chain.component.css']
})
export class FlightChainComponent implements OnInit {

  flight = null;
  error = null;
  loadingFlight = false;
  flightKey = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{2}-[0-9]{2}[A-Z]{3}[A-Z0-9]{2}[0-9]{4}/)]);

  constructor(private flightChainService: FlightChainService,
              private _logger: NGXLogger) {
  }

  ngOnInit() {
    let storedFlightKey = localStorage.getItem('flightChain.flightKey');
    if (!storedFlightKey) {
      storedFlightKey = '2017-07-14LHRBA0222';
    }
    this.flightKey.setValue(storedFlightKey);
    // this.searchFlight(this.flightKey);
  }

  public getInputErrorMessage(): string {
    return this.flightKey.hasError('required') ? 'You must enter a value' :
      this.flightKey.hasError('pattern') ? 'Not a valid flight key.' : '';
  }

  onClickSearch() {
    this._logger.debug('onClickSearch ' + this.flightKey.value);
    if (this.flightKey.valid) {
      this.resetFlightSearch();
      this.loadingFlight = true;
      console.log('xx')
      localStorage.setItem('flightChain.flightKey', this.flightKey.value);
      this.flightChainService.getFlight(this.flightKey.value)
        .subscribe((flight: AcrisFlight | HttpErrorResponse) => {
          this._logger.info('getFlightResult: ', flight);
          if (!this.isAcrisFlight(flight)) {
            this.error = flight;
            this.flight = null;
          } else {
            this.flight = flight;
            this.error = null;
          }
          this.loadingFlight = false;
        });
    }
  }

  getErrorMessage(): string {
    if (!this.error)
      return null;

    if (this.error instanceof HttpErrorResponse) {
      return this.error.message;
    }

    return 'Unknown error';
  }

  private resetFlightSearch() {
    this.error = null;
    this.flight = null;
  }

  /**
   * Return true if this flight is a valid acris flight (it might be a HttpErrorResponse)
   * @param flight
   */
  private isAcrisFlight(flight: any) {
    return flight.departureAirport !== undefined;
  }
}
