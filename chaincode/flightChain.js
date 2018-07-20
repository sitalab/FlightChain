/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

    // The Init method is called when the Smart Contract 'flightchain' is instantiated by the blockchain network
    // Best practice is to have any Ledger initialization in separate function -- see initLedger()
    async Init(stub) {
        console.info('=========== Instantiated flightchain chaincode ===========');
        return shim.success();
    }

    // The Invoke method is called as a result of an application request to run the Smart Contract
    // 'flightchain'. The calling application program has also specified the particular smart contract
    // function to be called, with arguments
    async Invoke(stub) {

        console.info('============= START : Invoke ===========');
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async getFlight(stub, args) {
        console.info('============= START : getFlight ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting FlightKey ex: 2018-07-22LHRBA0227');
        }
        let flightKey = args[0];

        let flightAsBytes = await stub.getState(flightKey); //get the car from chaincode state
        if (!flightAsBytes || flightAsBytes.toString().length <= 0) {
            throw new Error(flightKey + ' does not exist: ');
        }
        console.log(flightAsBytes.toString());
        return flightAsBytes;
    }

    async getFlightHistory(stub, args, thisClass) {
        console.info('============= START : getFlightHistory ===========');

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 1')
        }
        let flightKey = args[0];
        console.info('- start getFlightHistory: %s\n', flightKey);

        let resultsIterator = await stub.getHistoryForKey(flightKey);
        let method = thisClass['getAllResults'];
        let results = await method(resultsIterator, true);

        return Buffer.from(JSON.stringify(results));
    }

    /**
     * Iterate through the data from the ledger, and get the history of all transactions.
     *
     * @param iterator
     * @param isHistory
     * @returns {Promise<Array>}
     */
    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

    async initLedger(stub, args) {
        console.info('============= START : Initialize Ledger ===========');

        let json = "{\n" +
            "  \"operatingAirline\": {\n" +
            "    \"iataCode\": \"AA\",\n" +
            "    \"icaoCode\": \"AAL\",\n" +
            "    \"name\": \"American Airlines\"\n" +
            "  },\n" +
            "  \"aircraftType\": {\n" +
            "    \"icaoCode\": \"B757\",\n" +
            "    \"modelName\": \"757\",\n" +
            "    \"registration\": \"N606AA\"\n" +
            "  },\n" +
            "  \"flightNumber\": {\n" +
            "    \"airlineCode\": \"AA\",\n" +
            "    \"trackNumber\": \"1481\"\n" +
            "  },\n" +
            "  \"departureAirport\": \"MIA\",\n" +
            "  \"arrivalAirport\": \"SDQ\",\n" +
            "  \"originDate\": \"2017-04-05\",\n" +
            "  \"departure\": {\n" +
            "    \"scheduled\": \"2017-04-05T12:27:00-04:00\",\n" +
            "    \"estimated\": \"2017-04-05T12:27:00-04:00\",\n" +
            "    \"terminal\": \"N\",\n" +
            "    \"gate\": \"D47\"\n" +
            "  },\n" +
            "  \"arrival\": {\n" +
            "    \"scheduled\": \"2017-04-05T14:38:00-04:00\",\n" +
            "    \"terminal\": \"\",\n" +
            "    \"gate\": \"\",\n" +
            "    \"baggageClaim\": {\n" +
            "      \"carousel\": \"\"\n" +
            "    }\n" +
            "  },\n" +
            "  \"flightStatus\": \"Scheduled\"\n" +
            "}";

        console.info('============= END : Initialize Ledger ===========');
    }

    async createFlight(stub, args) {
        console.info('============= START : Create Car ===========');
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        console.log(args[0]);

        let flight = JSON.parse(args[0]);
        // TODO - verify that the flight object is valid ACRIS

        // TODO: Check if this docType needs to be set for couchDB
        flight.docType = 'flight';

        let flightNum = flight.flightNumber.trackNumber;
        while (flightNum.length < 4)
            flightNum = "0" + flightNum;
        let flightKey = flight.originDate + flight.departureAirport + flight.operatingAirline.iataCode + flightNum;
        console.log('FlightKey=',flightKey);


        await stub.putState(flightKey, Buffer.from(JSON.stringify(flight)));
        console.info('============= END : Create Car ===========');
    }


    async updateFlight(stub, args) {
        console.info('============= START : updateFlight ===========');
        if (args.length != 2) {
            throw new Error('Incorrect number of arguments. Expecting 2 (flightKey & new flight data)');
        }

        let flightKey = args[0];

        let flightAsBytes = await stub.getState(flightKey);
        let flight = JSON.parse(flightAsBytes);

        let flightDelta = JSON.parse(args[1]);
        var mergedFlight = Object.assign({}, flight, flightDelta);
        console.log('flightDelta', flightDelta);
        console.log('flight', flight);
        console.log('mergedFlight', mergedFlight);

        await stub.putState(flightKey, Buffer.from(JSON.stringify(mergedFlight)));
        console.info('============= END : updateFlight ===========');
    }
};

shim.start(new Chaincode());
