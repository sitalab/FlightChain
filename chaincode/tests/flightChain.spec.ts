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
        flightObject.txId = 'tx1';
        flightObject.updaterId = 'BA';
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

    it("Should NOT add a flight because operating airline doesn't match certificate", async () => {
        const stub = new ChaincodeMockStub("MyMockStub", chaincode, cert_BA);

        let flightObject = createFlight('2017-04-05', 'AA', '1481', 'MIA', 'SDQ');

        const response = await stub.mockInvoke("tx1", ['createFlight', JSON.stringify(flightObject)]);


    });

    /*
        it("Should be able to init and query all cars", async () => {
            stubWithInit = new ChaincodeMockStub("MyMockStub", chaincode);

            const response = await stubWithInit.mockInvoke("txID1", ["initLedger"]);

            expect(response.status).to.eql(200);

            const queryResponse = await stubWithInit.mockInvoke("txID2", ["queryAllCars"]);

            expect(Transform.bufferToObject(queryResponse.payload)).to.deep.eq([
                {
                    make: 'Toyota',
                    model: 'Prius',
                    color: 'blue',
                    owner: 'Tomoko',
                    docType: 'car'
                },
                {
                    make: 'Ford',
                    model: 'Mustang',
                    color: 'red',
                    owner: 'Brad',
                    docType: 'car'
                },
                {
                    make: 'Hyundai',
                    model: 'Tucson',
                    color: 'green',
                    owner: 'Jin Soo',
                    docType: 'car'
                },
                {
                    make: 'Volkswagen',
                    model: 'Passat',
                    color: 'yellow',
                    owner: 'Max',
                    docType: 'car'
                },
                {
                    make: 'Tesla',
                    model: 'S',
                    color: 'black',
                    owner: 'Adriana',
                    docType: 'car'
                },
                {
                    make: 'Peugeot',
                    model: '205',
                    color: 'purple',
                    owner: 'Michel',
                    docType: 'car'
                },
                {
                    make: 'Chery',
                    model: 'S22L',
                    color: 'white',
                    owner: 'Aarav',
                    docType: 'car'
                },
                {
                    make: 'Fiat',
                    model: 'Punto',
                    color: 'violet',
                    owner: 'Pari',
                    docType: 'car'
                },
                {
                    make: 'Tata',
                    model: 'Nano',
                    color: 'indigo',
                    owner: 'Valeria',
                    docType: 'car'
                },
                {
                    make: 'Holden',
                    model: 'Barina',
                    color: 'violet',
                    owner: 'Shotaro',
                    docType: 'car'
                }
            ])
        });

        it("Should be able to add a car", async () => {
            const stub = new ChaincodeMockStub("MyMockStub", chaincode);

            const response = await stub.mockInvoke("tx1", ['createCar', JSON.stringify({
                key: 'CAR0',
                make: "prop1",
                model: "prop2",
                color: "prop3",
                owner: 'owner'
            })]);

            expect(response.status).to.eql(200)

            const response = await stub.mockInvoke("tx1", ['queryCar', JSON.stringify({
                key: `CAR0`
            })]);

            expect(Transform.bufferToObject(response.payload)).to.deep.eq({
                'make': 'prop1',
                'model': 'prop2',
                'color': 'prop3',
                'owner': 'owner',
                'docType': 'car'
            })
        });

        it("Should be able to add a private car", async () => {
            const stub = new ChaincodeMockStub("MyMockStub", chaincode);

            const response = await stub.mockInvoke("tx1", ['createPrivateCar', JSON.stringify({
                key: 'CAR0',
                make: "prop1",
                model: "prop2",
                color: "prop3",
                owner: 'owner'
            })]);

            expect(response.status).to.eql(200);

            expect(Transform.bufferToObject(stub.privateCollections["testCollection"]["CAR0"])).to.deep.eq({
                'make': 'prop1',
                'model': 'prop2',
                'color': 'prop3',
                'owner': 'owner',
                'docType': 'car'
            })
        });

        it("Should be able to get a private car", async () => {
            const stub = new ChaincodeMockStub("MyMockStub", chaincode);

            const response = await stub.mockInvoke("tx1", ['createPrivateCar', JSON.stringify({
                key: 'CAR0',
                make: "prop1",
                model: "prop2",
                color: "prop3",
                owner: 'owner'
            })]);

            expect(response.status).to.eql(200);


            const queryRes = await stub.mockInvoke("tx4", ['queryPrivateCar', JSON.stringify({
                key: `CAR0`
            })]);

            expect(Transform.bufferToObject(queryRes.payload)).to.deep.eq({
                'make': 'prop1',
                'model': 'prop2',
                'color': 'prop3',
                'owner': 'owner',
                'docType': 'car'
            })
        });

        it("Should be able to update a car", async () => {
            const stub = new ChaincodeMockStub("MyMockStub", chaincode);

            const response = await stub.mockInvoke("tx1", ['createCar', JSON.stringify({
                key: 'CAR0',
                make: "prop1",
                model: "prop2",
                color: "prop3",
                owner: 'owner'
            })]);

            expect(response.status).to.eql(200);

            const response = await stub.mockInvoke("tx2", ['queryCar', JSON.stringify({
                key: `CAR0`
            })]);

            expect(Transform.bufferToObject(response.payload)).to.deep.eq({
                'make': 'prop1',
                'model': 'prop2',
                'color': 'prop3',
                'owner': 'owner',
                'docType': 'car'
            });

            const response = await stub.mockInvoke("tx3", ['changeCarOwner', JSON.stringify({
                key: `CAR0`,
                owner: 'newOwner'
            })]);

            expect(response.status).to.eql(200);

            const response = await stub.mockInvoke("tx4", ['queryCar', JSON.stringify({
                key: `CAR0`
            })]);


            expect(Transform.bufferToObject(response.payload).owner).to.eq("newOwner")
        });

        it("Should be able to run rich query", async () => {
            const response = await stubWithInit.mockInvoke("tx1", ['richQueryAllCars']);

            expect(response.status).to.eql(200);

            expect(Transform.bufferToObject(response.payload)).to.be.length(10);
        });

        it("Should be able to run gethistoryForKey", async () => {
            const response = await stubWithInit.mockInvoke("tx1", ['getCarHistory']);

            expect(response.status).to.eql(200);

            expect(Transform.bufferToObject(response.payload)).to.be.length(1);
            expect(Transform.bufferToObject(response.payload)[0].value.owner).to.eq("Tomoko")
        });
    */
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
        '    "airlineCode": "AA",\n' +
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
        '    "terminal": "",\n' +
        '    "gate": "",\n' +
        '    "baggageClaim": {\n' +
        '      "carousel": ""\n' +
        '    }\n' +
        '  },\n' +
        '  "flightStatus": "Scheduled"\n' +
        '}';
    let flightObject = JSON.parse(flightJson);
    return flightObject;
}