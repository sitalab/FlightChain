import {ClientIdentity} from "fabric-shim";
import {AcrisFlight} from "./acris-schema/AcrisFlight";


export class FlightChainLogic {


    /**
     * Generate the unique flight key from the ACRIS data.
     * @param {AcrisFlight} flight
     *
     * @returns {string}
     */
    static generateUniqueKey(flight: AcrisFlight): string {
        let flightNum = flight.flightNumber.trackNumber;
        while (flightNum.length < 4)
            flightNum = '0' + flightNum;
        let flightKey = flight.originDate + flight.departureAirport + flight.operatingAirline.iataCode + flightNum;
        console.log('generateUniqueKey: ', flightKey);
        return flightKey;
    }


    /**
     * Validate the ACRIS json data.
     *
     * @param {AcrisFlight} flight
     * @throws Error if the ACRIS is not valid
     */
    static verifyValidACRIS(flight: AcrisFlight): void {


        if (!flight || !flight.operatingAirline || !flight.operatingAirline.iataCode || flight.operatingAirline.iataCode.length !== 2) {
            let msg = `Invalid flight data, there is no valid flight.operatingAirline.iataCode set.`;
            console.log(msg, flight);
            throw new Error(msg);
        }
        if (!flight || !flight.departureAirport || flight.departureAirport.length !== 3) {
            let msg = 'Invalid flight data, there is no valid flight.departureAirport set.';
            console.log(msg, flight);
            throw new Error(msg);
        }
        if (!flight || !flight.arrivalAirport || flight.arrivalAirport.length !== 3) {
            let msg = 'Invalid flight data, there is no valid flight.arrivalAirport set.';
            console.log(msg, flight);
            throw new Error(msg);
        }
    }

    /**
     * Verify that the caller (identified by iata_code) is allowed to create/update this flight.
     *
     * @param {string} iata_code
     * @param {AcrisFlight} flight
     * @returns {boolean}
     */
    public static verifyAbleToCreateOrModifyFlight(iata_code: string, flight: AcrisFlight): void {

        if (!iata_code || iata_code.length > 3) {
            let msg = `Invalid iata-code '${iata_code}' `;
            console.log(msg);
            throw new Error(msg);
        }

        if (this.isAirline(iata_code)) {
            let operatingAirlne = this.getOperatingAirline(flight);
            if (operatingAirlne.toUpperCase() !== iata_code.toUpperCase()) {
                let msg = `Operating airline '${operatingAirlne}' does not match certificate iata-code '${iata_code}'`;
                console.log(msg);
                throw new Error(msg);
            }
        } else {
            let departureAirport = this.getDepartureAirport(flight);
            let arrivalAirport = this.getArrivalAirport(flight);
            if (iata_code.toUpperCase() !== departureAirport.toUpperCase() &&
                iata_code.toUpperCase() !== arrivalAirport.toUpperCase()) {
                let msg = `The iata airport code ${iata_code} does not match the departure airport (${departureAirport}) or the arrival airport (${arrivalAirport})`;
                console.log(msg);
                throw new Error(msg);
            }
        }
    }


    /**
     * If iata_code is 2, assume airline. Otherwise assume airport.
     * @param {string} iata_code
     * @returns {boolean}
     */
    private static isAirline(iata_code: string) {
        return iata_code.length === 2;
    }

    private static getOperatingAirline(flight: AcrisFlight) {
        return flight.operatingAirline.iataCode;
    }

    private static getDepartureAirport(flight: AcrisFlight) {
        return flight.departureAirport;
    }

    private static getArrivalAirport(flight: AcrisFlight) {
        return flight.arrivalAirport;
    }

}