'use strict';

import {Chaincode, StubHelper} from '@theledger/fabric-chaincode-utils';
import {CertificateHelper} from './certificateHelper';
import {FlightChainLogic} from './flightChainLogic';

const merge = require('deepmerge');

export class FlightChain extends Chaincode {

    certificateHelper = new CertificateHelper();

    /**
     * Must be defined, even if it is a NOOP
     *
     * @param {StubHelper} stubHelper
     * @param {string[]} args
     * @returns {Promise<void>}
     */
    async initLedger(stubHelper: StubHelper, args: string[]) {
        console.log('============= START : initLedger ===========');
        await stubHelper.putState('version', 'MyVersion');
    }

    /**
     * Return a single flight, as identified by the flight key.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<any>}
     */
    async version(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : version ===========');
        return await stubHelper.getStateAsObject('version');
    }

    /**
     * Return a single flight, as identified by the flight key.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<any>}
     */
    async getFlight(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : getFlight ===========');

        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting FlightKey ex: 2018-07-22LHRBA0227');
        }
        const flightKey = args[0];
        return await stubHelper.getStateAsObject(flightKey);
    }

    /**
     * Return the history of updates for a single flight, as identified by the flight key.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<void>}
     */
    async getFlightHistory(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : getFlightHistory ===========');

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting FlightKey ex: 2018-07-22LHRBA0227');
        }
        const flightKey = args[0];
        console.log('- start getFlightHistory: %s\n', flightKey);
        return await stubHelper.getHistoryForKeyAsList(flightKey);
    }

    /**
     * Create a new flight on the network.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<void>}
     */
    async createFlight(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : Create Flight ===========');
        // console.log('stub.getCreator', stubHelper.getClientIdentity());

        const iataCode = CertificateHelper.getIataCode(stubHelper.getClientIdentity());

        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting one argument containing ACRIS flight data.');
        }
        console.log(args[0]);
        const flight: any = JSON.parse(args[0]);

        if (!flight) {
            const msg = `No ACRIS flightdata passed in as arg[0] '${args[0]}'`;
            console.error(msg);
            throw new Error(msg);
        }

        FlightChainLogic.verifyValidACRIS(flight);
        FlightChainLogic.verifyAbleToCreateOrModifyFlight(iataCode, flight);

        const flightKey = FlightChainLogic.generateUniqueKey(flight);
        const existingFlight = await stubHelper.getStateAsObject(flightKey);
        if (existingFlight) {
            const msg = `A flight with this flight key '${flightKey}' already exists`;
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: Check if this docType needs to be set for couchDB
        flight.docType = 'flight';

        // TODO: Is this best place to add these values ? The history doesn't seem to easily allow way to determine who updates.
        flight.updaterId = iataCode;
        flight.txId = stubHelper.getStub().getTxID();

        await stubHelper.putState(flightKey, flight);
        console.log('============= END : Create Flight ===========');
    }

    /**
     * Update an existing flight on the network.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<void>}
     */
    async updateFlight(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log(`============= START : updateFlight key ${args[0]} ===========`);
        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting 2 (flightKey & new ACRIS flight data)');
        }
        const iataCode = CertificateHelper.getIataCode(stubHelper.getClientIdentity());

        const flightKey = args[0];
        const flightDelta = JSON.parse(args[1]);

        // TODO: Verify that the flight already exists & return appropriate error 404 message if it does not exist
        const existingFlight: any = await stubHelper.getStateAsObject(flightKey);
        if (!existingFlight) {
            const msg = `A flight with this flight key '${flightKey}' does not yet exist. It must be created first`;
            console.error(msg);
            throw new Error(msg);
        }

        FlightChainLogic.verifyAbleToCreateOrModifyFlight(iataCode, existingFlight);

        const mergedFlight = merge(existingFlight, flightDelta);
        console.log('flightDelta', flightDelta);
        console.log('existingFlight', existingFlight);
        console.log('mergedFlight', mergedFlight);

        FlightChainLogic.verifyValidACRIS(mergedFlight);

        const mergedFlightKey = FlightChainLogic.generateUniqueKey(mergedFlight);
        if (mergedFlightKey !== flightKey) {
            const msg = `You cannot change data that will modify the flight key (originDate, departureAirport, operatingAirline.iataCode or flightNumber.trackNumber)`;
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: Is this best place to add these values ? The history doesn't seem to easily allow way to determine who updates.
        mergedFlight.updaterId = iataCode;
        mergedFlight.txId = stubHelper.getStub().getTxID();

        await stubHelper.putState(flightKey, mergedFlight);
        console.log('============= END : updateFlight ===========');
    }

}
