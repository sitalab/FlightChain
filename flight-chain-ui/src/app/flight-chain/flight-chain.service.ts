import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {AcrisFlight} from "../acris-schema/AcrisFlight";
import {catchError, tap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {NGXLogger} from "ngx-logger";

@Injectable({
  providedIn: 'root'
})
export class FlightChainService {

  constructor(private http: HttpClient,
              private _logger: NGXLogger) {
  }

  private flightURL = 'http://localhost:3000/';  // URL to web api

  /** GET heroes from the server */
  getFlight(flightKey: String): Observable<AcrisFlight | HttpErrorResponse> {
    return this.http.get<AcrisFlight>(this.flightURL + flightKey)
      .pipe(
        tap(flight => this._logger.debug('fetched flight')),
        catchError(this.handleError('getFlight', null))
      );
  }

  /**
   * Handle the error, and return empty result to let app continue
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      this._logger.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this._logger.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(error);
    };
  }

}
