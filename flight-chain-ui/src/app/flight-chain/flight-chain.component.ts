import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {FlightChainService} from "./flight-chain.service";
import {NGXLogger} from "ngx-logger";
import {AcrisFlight} from "../acris-schema/AcrisFlight";
import {HttpErrorResponse} from "@angular/common/http";
import _ from "lodash";
import {FlightChainHistory} from "../acris-schema/AcrisFlightHistoryFromBlockchain";

@Component({
  selector: 'app-flight-chain',
  templateUrl: './flight-chain.component.html',
  styleUrls: ['./flight-chain.component.css']
})
export class FlightChainComponent implements OnInit {

  /**
   * This contains the current most up to date flight status
   */
  flightLive = null;
  /**
   * This contains the history of all flight changes
   */
  flightHistory = null;
  /**
   * NonNull if there was an error loading the flight data
   */
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
      console.log('xx');
      localStorage.setItem('flightChain.flightKey', this.flightKey.value);
      this.flightChainService.getFlightHistory(this.flightKey.value)
        .subscribe((flights: FlightChainHistory[]) => {
          this._logger.info('getFlightResult: ', flights);
          if (!this.isAcrisFlight(flights[0])) {
            this.error = flights;
            this.flightHistory = null;
          } else {
            this.flightHistory = this.processFlightsHistory(flights);
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

    console.log('unknown error', this.error);
    return 'Unknown error';
  }

  private resetFlightSearch() {
    this.error = null;
    this.flightHistory = null;
  }

  /**
   * Return true if this flight is a valid acris flight (it might be a HttpErrorResponse)
   * @param flight
   */
  private isAcrisFlight(flight: any) {
    return flight !== undefined && flight.value !== undefined && flight.value.departureAirport !== undefined;
  }

  /**
   * Flight at index 0 is the oldest flight.
   *
   * Each element in the flight history contains the full merged ACRIS flight status. For display purposes
   * we want to show the original ACRIS flight data sent to blockchain, and then the deltas after that.
   * Process the flight updates to identify the delta from two ACRIS array elements.
   *
   * @param flights
   */
  private processFlightsHistory(flights: FlightChainHistory[]) {

    this.flightLive = flights[flights.length - 1];
    let i = 0;
    let deltas = [];

    /**
     * Add the creation element to the start of the array.
     */
    let originalFlight = _.clone(flights[0]);
    originalFlight.updaterId = originalFlight.value.updaterId;
    deltas.push(originalFlight);

    /**
     * Now process all other flights to just add the deltas to this array
     */
    for (i = 1; i < flights.length; i++) {

      let original = flights[i - 1];
      let merged = flights[i];

      let deepDiff = this.difference(merged.value, original.value);
      let mergedCopy = _.clone(merged);
      mergedCopy.value = deepDiff;

      /**
       * Move the updaterId to the root of the object, and remove them from teh value (the ARCRIS data)
       * to keep the display of deltas clean.
       */
      mergedCopy.updaterId = merged.value.updaterId;

      mergedCopy.value.txId = undefined;
      mergedCopy.value.updaterId = undefined;
      deltas.push(mergedCopy);

    }
    return deltas;
  }


  /**
   * Deep diff between two object, using lodash
   * @param  {Object} object Object compared
   * @param  {Object} base   Object to compare with
   * @return {Object}        Return a new object who represent the diff
   */
  private difference(object, base) {
    function changes(object, base) {
      return _.transform(object, function (result, value, key) {
        if (!_.isEqual(value, base[key])) {
          result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }

    return changes(object, base);
  }
}
