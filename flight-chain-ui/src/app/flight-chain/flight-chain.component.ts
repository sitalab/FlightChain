import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {FlightChainService} from "./flight-chain.service";
import {NGXLogger} from "ngx-logger";
import {AcrisFlight} from "../acris-schema/AcrisFlight";
import {HttpErrorResponse} from "@angular/common/http";
import _ from "lodash";

@Component({
  selector: 'app-flight-chain',
  templateUrl: './flight-chain.component.html',
  styleUrls: ['./flight-chain.component.css']
})
export class FlightChainComponent implements OnInit {

  flightLive = null;
  flightHistory = null;
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
      this.flightChainService.getFlightHistory(this.flightKey.value)
        .subscribe((flights: any | HttpErrorResponse) => {
          this._logger.info('getFlightResult: ', flights);
          if (!this.isAcrisFlight(flights[0])) {
            this.error = flights;
            this.flightHistory = null;
          } else {
            this.flightHistory = this.processFlights(flights);
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
   * @param flights
   */
  private processFlights(flights: any[]) {

    this.flightLive = flights[flights.length-1];
    let i=0;
    let deltas = [];
    deltas.push(flights[0]);

    for (i=1; i<flights.length; i++) {

      let original = flights[i-1];
      let merged = flights[i];

      let deepDiff = this.difference(merged.value, original.value);
      let mergedCopy = _.clone(merged);
      mergedCopy.value = deepDiff;
      deltas.push(mergedCopy);

    }
    //deltas.push(currentStatus);
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
      return _.transform(object, function(result, value, key) {
        if (!_.isEqual(value, base[key])) {
          result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }
    return changes(object, base);
  }

}
var deepDiffMapper = function() {
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function(obj1, obj2) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          type: this.compareValues(obj1, obj2),
          data: (obj1 === undefined) ? obj2 : obj1
        };
      }

      var diff = {};
      for (var key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }

        var value2 = undefined;
        if ('undefined' != typeof(obj2[key])) {
          value2 = obj2[key];
        }

        diff[key] = this.map(obj1[key], value2);
      }
      for (var key in obj2) {
        if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
          continue;
        }

        diff[key] = this.map(undefined, obj2[key]);
      }

      return diff;

    },
    compareValues: function(value1, value2) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if ('undefined' == typeof(value1)) {
        return this.VALUE_CREATED;
      }
      if ('undefined' == typeof(value2)) {
        return this.VALUE_DELETED;
      }

      return this.VALUE_UPDATED;
    },
    isFunction: function(obj) {
      return {}.toString.apply(obj) === '[object Function]';
    },
    isArray: function(obj) {
      return {}.toString.apply(obj) === '[object Array]';
    },
    isObject: function(obj) {
      return {}.toString.apply(obj) === '[object Object]';
    },
    isDate: function(obj) {
      return {}.toString.apply(obj) === '[object Date]';
    },
    isValue: function(obj) {
      return !this.isObject(obj) && !this.isArray(obj);
    }
  }
}();
