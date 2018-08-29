/* tslint:disable */

import {FlightChain} from '../src/flightChain';
import {ChaincodeMockStub, Transform} from '@theledger/fabric-mock-stub';

import {expect} from "chai";

const chaincode = new FlightChain();

let stubWithInit;


describe('Test FlightChain', () => {

    let cert_BA = '-----BEGIN CERTIFICATE-----' +
        'MIICrDCCAlKgAwIBAgIUag/SyD5TC4MY+gQEhc/ssM3LQh0wCgYIKoZIzj0EAwIw' +
        'czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh' +
        'biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT' +
        'E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwNzI0MTIzMjAwWhcNMTkwNzI0MTIz' +
        'NzAwWjBIMTkwFgYDVQQLEw9GbGlnaHRDaGFpblVzZXIwCwYDVQQLEwRvcmcxMBIG' +
        'A1UECxMLZGVwYXJ0bWVudDExCzAJBgNVBAMTAkJBMFkwEwYHKoZIzj0CAQYIKoZI' +
        'zj0DAQcDQgAEhq9pA3c+0eTdsIyjHmXWR290BJibNtJ9F2qHwNgfJpJxzF1q8LYN' +
        'giKChFJpc0XEmlXQ4KgB+tNBp1ciJ36AAaOB7jCB6zAOBgNVHQ8BAf8EBAMCB4Aw' +
        'DAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUSXUmNZjC/pYUQuCm8m4WlTrMDLswKwYD' +
        'VR0jBCQwIoAgQjmqDc122u64ugzacBhR0UUE0xqtGy3d26xqVzZeSXwwfwYIKgME' +
        'BQYHCAEEc3siYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1l' +
        'bnQxIiwiaGYuRW5yb2xsbWVudElEIjoiQkEiLCJoZi5UeXBlIjoiRmxpZ2h0Q2hh' +
        'aW5Vc2VyIiwiaWF0YS1jb2RlIjoiQkEifX0wCgYIKoZIzj0EAwIDSAAwRQIhAJOo' +
        'UrM2E6pobOclWS7xTIfalGdhf1G0gLuQfMFx/IPyAiA7f7WIChqLFDvRRjBTX0KH' +
        'zUgHZTBYcbp3axh5U84MXw==' +
        '-----END CERTIFICATE-----';

    let cert_MIA= '-----BEGIN CERTIFICATE-----' +
        'MIICsTCCAligAwIBAgIUEYRfX0N1Uik7Oq9pktiJ5xkvz2IwCgYIKoZIzj0EAwIw' +
        'dTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh' +
        'biBGcmFuY2lzY28xGjAYBgNVBAoTEXNhbmRib3guc2l0YS5hZXJvMR0wGwYDVQQD' +
        'ExRjYS5zYW5kYm94LnNpdGEuYWVybzAeFw0xODA4MjgwOTE1MDBaFw0xOTA4Mjgw' +
        'OTIwMDBaMEkxOTAWBgNVBAsTD0ZsaWdodENoYWluVXNlcjALBgNVBAsTBG9yZzEw' +
        'EgYDVQQLEwtkZXBhcnRtZW50MTEMMAoGA1UEAxMDTUlBMFkwEwYHKoZIzj0CAQYI' +
        'KoZIzj0DAQcDQgAEyXqhS36q+K7XLZLGBx/HLzbXto+SpvEDQiJTOeeYSvmfIwyp' +
        'tTp0YLuwxt98L8wGqs2xiEh8K/M4DM9HYE+aMKOB8TCB7jAOBgNVHQ8BAf8EBAMC' +
        'B4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUhoH/g5Z/wZyzjWRtmxUkpE4Dwlgw' +
        'KwYDVR0jBCQwIoAgu7wYI4G3X0pTpyHF7rUJHs1h4ZtIYKwvtQ+r+fan4RUwgYEG' +
        'CCoDBAUGBwgBBHV7ImF0dHJzIjp7ImhmLkFmZmlsaWF0aW9uIjoib3JnMS5kZXBh' +
        'cnRtZW50MSIsImhmLkVucm9sbG1lbnRJRCI6Ik1JQSIsImhmLlR5cGUiOiJGbGln' +
        'aHRDaGFpblVzZXIiLCJpYXRhLWNvZGUiOiJNSUEifX0wCgYIKoZIzj0EAwIDRwAw' +
        'RAIgRJ/kKkxcARb1PWdMtr0l5x6aNh5uOteHgVLzsCKFQn4CIDbAUVRF4qVQwJl6' +
        'xdC9qbXfXLDzf2UL+d60mi/bPK4M' +
        '-----END CERTIFICATE-----';

    it("Should init without issues", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode);
        const response = await stub.mockInit("tx1", []);
        expect(response.status).to.eql(200)
    });



    it("Should add a flight", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');

        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);

        expect(response.status).to.eql(200)

        response = await stub.mockInvoke("tx4", ['getFlight', '2017-04-05MIABA1481']);

        // These should be added on by the chaincode.
        flightObject.docType = 'flight';
        flightObject.updaterId = 'BA';
        flightObject.txId = 'tx1';
        expect(Transform.bufferToObject(response.payload)).to.deep.eq(flightObject);

    });

    it("Should NOT add a flight if one already exists with same flight key", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let responseSuccess = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(responseSuccess.status).to.eql(200)

        let responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);

        expect(responseExpectFail.status).to.eql(500)
        // console.log(response);
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"A flight with this flight key \'2017-04-05MIABA1481\' already exists"}');
    });

    it("Should NOT add a flight if the json is invalid", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid flight.operatingAirline.iataCode set."}');
    });
    it("Should NOT add a flight if the json is missing departureAirport", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({operatingAirline:{iataCode:"BA"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid flight.departureAirport set."}');
    });
    it("Should NOT add a flight if the json is missing arrivalAirport", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({departureAirport:"LHR", operatingAirline:{iataCode:"BA"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid flight.arrivalAirport set."}');
    });
    it("Should NOT add a flight if the json is missing flightnumber", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({departureAirport:"LHR", arrivalAirport:"ORK", operatingAirline:{iataCode:"BA"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid 4 digit flight.flightNumber.trackNumber set."}');
    });
    it("Should NOT add a flight if the json is missing originDate", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({flightNumber:{trackNumber:"0132"}, departureAirport:"LHR", arrivalAirport:"ORK", operatingAirline:{iataCode:"BA"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid flight.originDate set (e.g. 2018-09-13)."}');
    });
    it("Should NOT add a flight if the json has invalid originDate", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        //let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify({originDate: "0-0-0", flightNumber:{trackNumber:"0132"}, departureAirport:"LHR", arrivalAirport:"ORK", operatingAirline:{iataCode:"BA"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Invalid flight data, there is no valid flight.originDate set (e.g. 2018-09-13)."}');
    });
    it("Should NOT add a flight because operating airline doesn't match certificate", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let flightObject = createFlight('2018-01-01', 'AA', '1481', 'MIA', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"Operating airline \'AA\' does not match certificate iata-code \'BA\'"}');
    });

    it("Should NOT add a flight because departure or arrival airport doesn't match certificate", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_MIA);

        let flightObject = createFlight('2017-04-05', 'AA', '1481', 'DUB', 'SDQ');

        const responseExpectFail = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"The iata airport code MIA does not match the departure airport (DUB) or the arrival airport (SDQ)"}');
    });

    it("Should correctly MERGE a flight", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let NEW_ESTIMATED_ARRIVAL = '2018-07-31T08:04:00-06:00';
        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(response.status).to.eql(200)

        let responseUpdate = await stub.mockInvoke("tx1", ['updateFlight', '2017-04-05MIABA1481', JSON.stringify({ arrival:{estimated: NEW_ESTIMATED_ARRIVAL}})]);
        expect(responseUpdate.status).to.eql(200)

        response = await stub.mockInvoke("tx4", ['getFlight', '2017-04-05MIABA1481']);

        // These should be added on by the chaincode.
        flightObject.docType = 'flight';
        flightObject.updaterId = 'BA';
        flightObject.txId = 'tx1';
        flightObject.arrival.estimated =NEW_ESTIMATED_ARRIVAL;
        expect(Transform.bufferToObject(response.payload)).to.deep.eq(flightObject);

    });

    it("Should NOT merge a flight because departure date is changed", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let NEW_ESTIMATED_ARRIVAL = '2018-07-31T08:04:00-06:00';
        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(response.status).to.eql(200)

        let responseExpectFail = await stub.mockInvoke("tx1", ['updateFlight', '2017-04-05MIABA1481', JSON.stringify({ originDate:"2010-01-01"})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"You cannot change data that will modify the flight key (originDate, departureAirport, operatingAirline.iataCode or flightNumber.trackNumber)"}');
    });
    it("Should NOT merge a flight because departure airport is changed", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let NEW_ESTIMATED_ARRIVAL = '2018-07-31T08:04:00-06:00';
        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(response.status).to.eql(200)

        let responseExpectFail = await stub.mockInvoke("tx1", ['updateFlight', '2017-04-05MIABA1481', JSON.stringify({ departureAirport:"ORK"})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"You cannot change data that will modify the flight key (originDate, departureAirport, operatingAirline.iataCode or flightNumber.trackNumber)"}');
    });
    it("Should NOT merge a flight because operating airline is changed", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let NEW_ESTIMATED_ARRIVAL = '2018-07-31T08:04:00-06:00';
        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(response.status).to.eql(200)

        let responseExpectFail = await stub.mockInvoke("tx1", ['updateFlight', '2017-04-05MIABA1481', JSON.stringify({ operatingAirline:{iataCode:"FR"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"You cannot change data that will modify the flight key (originDate, departureAirport, operatingAirline.iataCode or flightNumber.trackNumber)"}');
    });
    it("Should NOT merge a flight because flightnumber is changed", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let NEW_ESTIMATED_ARRIVAL = '2018-07-31T08:04:00-06:00';
        let flightObject = createFlight('2017-04-05', 'BA', '1481', 'MIA', 'SDQ');
        let response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);
        expect(response.status).to.eql(200)

        let responseExpectFail = await stub.mockInvoke("tx1", ['updateFlight', '2017-04-05MIABA1481', JSON.stringify({ flightNumber:{trackNumber:"9999"}})]);
        expect(responseExpectFail.status).to.eql(500)
        expect(responseExpectFail.message).to.eql('{"name":"Error","status":500,"message":"You cannot change data that will modify the flight key (originDate, departureAirport, operatingAirline.iataCode or flightNumber.trackNumber)"}');
    });
});


function createFlight(originDate: string, operatingAirline: string, flightNumber: string, depAirport: string, arrAirport: string) {
    let flightJson = '{\n' +
        '  "operatingAirline": {\n' +
        '    "iataCode": "' + operatingAirline + '",\n' +
        '    "icaoCode": "AAL",\n' +
        '    "name": "American Airlines"\n' +
        '  },\n' +
        '  "aircraftType": {\n' +
        '    "icaoCode": "B757",\n' +
        '    "modelName": "757",\n' +
        '    "registration": "N606AA"\n' +
        '  },\n' +
        '  "flightNumber": {\n' +
        '    "airlineCode": "' + operatingAirline + '",\n' +
        '    "trackNumber": "' + flightNumber + '"\n' +
        '  },\n' +
        '  "departureAirport": "' + depAirport + '",\n' +
        '  "arrivalAirport": "' + arrAirport + '",\n' +
        '  "originDate": "' + originDate + '",\n' +
        '  "departure": {\n' +
        '    "scheduled": "2017-04-05T12:27:00-04:00",\n' +
        '    "estimated": "2017-04-05T12:27:00-04:00",\n' +
        '    "terminal": "N",\n' +
        '    "gate": "D47"\n' +
        '  },\n' +
        '  "arrival": {\n' +
        '    "scheduled": "2017-04-05T14:38:00-04:00",\n' +
        '    "terminal": "S",\n' +
        '    "gate": "A20",\n' +
        '    "baggageClaim": {\n' +
        '      "carousel": "4"\n' +
        '    }\n' +
        '  },\n' +
        '  "flightStatus": "Scheduled"\n' +
        '}';
    return JSON.parse(flightJson);
}