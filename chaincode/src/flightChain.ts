/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';

import {Chaincode, StubHelper} from '@theledger/fabric-chaincode-utils';
import {CertificateHelper} from "./certificateHelper";
import {FlightChainLogic} from "./flightChainLogic";
import {AcrisFlight} from "./acris-schema/AcrisFlight";

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
        let flightKey = args[0];

        return  await stubHelper.getStateAsObject(flightKey);
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
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        let flightKey = args[0];
        console.log('- start getFlightHistory: %s\n', flightKey);

        return await stubHelper.getHistoryForKeyAsList(flightKey);

        // let resultsIterator = await stubHelper.getHistoryForKey(flightKey);
        // let method = thisClass['getAllResults'];
        // let results = await method(resultsIterator, true);
        //
        // return Buffer.from(JSON.stringify(results));
    }

    /**
     * Create a new flight on the network.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<void>}
     */
    async createFlight(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : Create Car ===========');
        console.log('stub.getCreator', stubHelper.getClientIdentity());

        let iataCode = CertificateHelper.getIataCode(stubHelper.getClientIdentity());

        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        console.log(args[0]);

        let flight: any = JSON.parse(args[0]);

        if (!flight) {
            let msg = `No ACRIS flightdata passed in as arg[0] '${args[0]}'`;
            console.error(msg);
            throw new Error(msg);
        }



        FlightChainLogic.verifyValidACRIS(flight);
        FlightChainLogic.verifyAbleToCreateOrModifyFlight(iataCode, flight);

        let flightKey = FlightChainLogic.generateUniqueKey(flight);
        let existingFlight = await stubHelper.getStateAsObject(flightKey);
        if (existingFlight) {
            let msg = `A flight with this flight key '${flightKey}' already exists`;
            console.error(msg);
            throw new Error(msg);
        }

        // TODO: Check if this docType needs to be set for couchDB
        flight.docType = 'flight';

        // TODO: Is this best place to add these values ? The history doesn't seem to easily allow way to determine who updates.
        flight.txId = stubHelper.getStub().getTxID();
        flight.updaterId = iataCode;

        await stubHelper.putState(flightKey, flight);
        console.log('============= END : Create Car ===========');
    }

    /**
     * Update an existing flight on the network.
     *
     * @param stubHelper
     * @param args
     * @returns {Promise<void>}
     */
    async updateFlight(stubHelper: StubHelper, args: string[]): Promise<any> {
        console.log('============= START : updateFlight ===========');
        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting 2 (flightKey & new flight data)');
        }
        let iataCode = CertificateHelper.getIataCode(stubHelper.getClientIdentity());

        let flightKey = args[0];
        let flightDelta = JSON.parse(args[1]);

        FlightChainLogic.verifyValidACRIS(flightDelta);
        FlightChainLogic.verifyAbleToCreateOrModifyFlight(iataCode, flightDelta);

        // TODO: Verify that the flight already exists & return appropriate error 404 message if it does not exist
        let existingFlight = await stubHelper.getStateAsObject(flightKey);
        if (!existingFlight) {
            let msg = `A flight with this flight key '${flightKey}' does not yet exist. It must be created first`;
            console.error(msg);
            throw new Error(msg);
        }

        let mergedFlight = Object.assign({}, existingFlight, flightDelta);
        console.log('flightDelta', flightDelta);
        console.log('existingFlight', existingFlight);
        console.log('mergedFlight', mergedFlight);
        // TODO: Is this best place to add these values ? The history doesn't seem to easily allow way to determine who updates.
        mergedFlight.txId = stubHelper.getStub().getTxID();
        mergedFlight.updaterId = iataCode;

        await stubHelper.putState(flightKey, mergedFlight);
        console.log('============= END : updateFlight ===========');
    }

}
