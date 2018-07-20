import {Injectable} from '@nestjs/common';
import {AcrisFlight} from '../acris-schema/AcrisFlight';

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

@Injectable()
export class FlightChainService {
    private readonly flights: AcrisFlight[] = [];

    private fabric_client = null;
    private channel = null;
    private member_user;

    constructor() {

        this.fabric_client = new Fabric_Client();
        // TODO - should channel name be env or API param?
        this.channel = this.fabric_client.newChannel('mychannel');
        // TODO - change to env variable
        this.channel.addPeer(this.fabric_client.newPeer('grpc://localhost:7051'));

        this.channel.addOrderer(this.fabric_client.newOrderer('grpc://localhost:7050'));

        var member_user = null;
        var store_path = path.join('/Users/kosullivan/Dev/Blockchain2/fabric-samples/fabcar/', 'hfc-key-store');
        console.log('Store path:' + store_path);
        var tx_id = null;

        // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
        Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        }).then((state_store) => {
            // assign the store to the fabric client
            this.fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            this.fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return this.fabric_client.getUserContext('user1', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user1 from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get user1.... run registerUser.js');
            }
        })

    }


    public async findOne(flightKey: string): Promise<AcrisFlight> {

        console.log('FlightChainService.findOne()', flightKey);
        // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
        // queryAllCars chaincode function - requires no arguments , ex: args: [''],
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'flightchain',
            fcn: 'getFlight',
            args: [flightKey]
        };

        return this.queryChainCodeState(request);
    }

    public async findFlightHistory(flightKey: any): Promise<AcrisFlight> {
        console.log('FlightChainService.findFlightHistory()', flightKey);
        // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
        // queryAllCars chaincode function - requires no arguments , ex: args: [''],
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'flightchain',
            fcn: 'getFlightHistory',
            args: [flightKey]
        };
        return this.queryChainCodeState(request);

    }


    public async findAll(): Promise<AcrisFlight[]> {

        console.log('FlightChainService.findAll()');
        // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
        // queryAllCars chaincode function - requires no arguments , ex: args: [''],
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'fabcar',
            fcn: 'queryAllCars',
            args: ['']
        };

        return this.queryChainCodeState(request);
    }

    public async updateFlight(flightKey: string, flightDelta: AcrisFlight): Promise<AcrisFlight> {
        console.log('FlightChainService.updateFlight()');

        // get a transaction id object based on the current user assigned to fabric client
        let tx_id = this.fabric_client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);

        // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Dave'],
        // must send the proposal to endorsing peers
        let request = {
            //targets: let default to the peer assigned to the client
            chaincodeId: 'flightchain',
            fcn: 'updateFlight',
            args: [flightKey, JSON.stringify(flightDelta)],
            chainId: 'mychannel',
            txId: tx_id,
            proposalResponses: null,
            proposal: null
        };

        return new Promise<any>((resolve, reject) => {
            // send the transaction proposal to the peers
            this.channel.sendTransactionProposal(request)
                .then((results) => {
                    let proposalResponses = results[0];
                    let proposal = results[1];
                    let isProposalGood = false;
                    if (proposalResponses && proposalResponses[0].response &&
                        proposalResponses[0].response.status === 200) {
                        isProposalGood = true;
                        console.log('Transaction proposal was good');
                    } else {
                        console.error('Transaction proposal was bad');
                        reject('Transaction proposal was bad');
                    }
                    if (!isProposalGood) {
                        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                        reject('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    }


                    console.log(util.format(
                        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        proposalResponses[0].response.status, proposalResponses[0].response.message));

                    // build up the request for the orderer to have the transaction committed
                    request.proposalResponses = proposalResponses;
                    request.proposal = proposal;

                    // set the transaction listener and set a timeout of 30 sec
                    // if the transaction did not get committed within the timeout period,
                    // report a TIMEOUT status
                    var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                    var promises = [];

                    console.log('sendTransaction', request);
                    var sendPromise = this.channel.sendTransaction(request);
                    promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

                    // get an eventhub once the fabric client has a user assigned. The user
                    // is required bacause the event registration must be signed
                    let event_hub = this.fabric_client.newEventHub();
                    event_hub.setPeerAddr('grpc://localhost:7053');

                    // using resolve the promise so that result status may be processed
                    // under the then clause rather than having the catch clause process
                    // the status
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({event_status: 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                        }, 3000);
                        console.log('event_hub.connect');
                        event_hub.connect();
                        console.log('event_hub.registerTxEvent');
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            // this is the callback for transaction event status
                            // first some clean up of event listener
                            clearTimeout(handle);
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();

                            // now let the application know what happened
                            var return_status = {event_status: code, tx_id: transaction_id_string};
                            if (code !== 'VALID') {
                                console.error('The transaction was invalid, code = ' + code);
                                resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                            } else {
                                console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
                                resolve(return_status);
                            }
                        }, (err) => {
                            //this is the callback if something goes wrong with the event registration or processing
                            reject(new Error('There was a problem with the eventhub ::' + err));
                        });
                    });
                    promises.push(txPromise);

                    console.log('return promise.all()');
                    return Promise.all(promises);
                }).then((results) => {

                console.log('Send transaction promise and event listener promise have completed', results);
                // check the results in the order the promises were added to the promise all list
                if (results && results[0] && results[0].status === 'SUCCESS') {
                    console.log('Successfully sent transaction to the orderer.');
                } else {
                    console.error('Failed to order the transaction. Error code: ' + results[0].status);
                    reject('Failed to order the transaction. Error code: ' + results[0].status);
                }

                if (results && results[1] && results[1].event_status === 'VALID') {
                    console.log('Successfully committed the change to the ledger by the peer');
                    resolve(results);
                } else {
                    console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                    reject('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                }

            })
                .catch((error) => {
                    console.error('An error occurred with the transaction ', error);
                    reject(error);
                });
        });

    }


    public async createFlight(flight: AcrisFlight): Promise<AcrisFlight> {
        console.log('FlightChainService.createFlight()');

        // get a transaction id object based on the current user assigned to fabric client
        let tx_id = this.fabric_client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);

        // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Dave'],
        // must send the proposal to endorsing peers
        let request = {
            //targets: let default to the peer assigned to the client
            chaincodeId: 'flightchain',
            fcn: 'createFlight',
            args: [JSON.stringify(flight)],
            chainId: 'mychannel',
            txId: tx_id,
            proposalResponses: null,
            proposal: null
        };

        return new Promise<any>((resolve, reject) => {
            // send the transaction proposal to the peers
            this.channel.sendTransactionProposal(request)
                .then((results) => {
                    let proposalResponses = results[0];
                    let proposal = results[1];
                    let isProposalGood = false;
                    if (proposalResponses && proposalResponses[0].response &&
                        proposalResponses[0].response.status === 200) {
                        isProposalGood = true;
                        console.log('Transaction proposal was good');
                    } else {
                        console.error('Transaction proposal was bad');
                        reject('Transaction proposal was bad');
                    }
                    if (!isProposalGood) {
                        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                        reject('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    }


                    console.log(util.format(
                        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        proposalResponses[0].response.status, proposalResponses[0].response.message));

                    // build up the request for the orderer to have the transaction committed
                    request.proposalResponses = proposalResponses;
                    request.proposal = proposal;

                    // set the transaction listener and set a timeout of 30 sec
                    // if the transaction did not get committed within the timeout period,
                    // report a TIMEOUT status
                    var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                    var promises = [];

                    console.log('sendTransaction', request);
                    var sendPromise = this.channel.sendTransaction(request);
                    promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

                    // get an eventhub once the fabric client has a user assigned. The user
                    // is required bacause the event registration must be signed
                    let event_hub = this.fabric_client.newEventHub();
                    event_hub.setPeerAddr('grpc://localhost:7053');

                    // using resolve the promise so that result status may be processed
                    // under the then clause rather than having the catch clause process
                    // the status
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({event_status: 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                        }, 3000);
                        console.log('event_hub.connect');
                        event_hub.connect();
                        console.log('event_hub.registerTxEvent');
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            // this is the callback for transaction event status
                            // first some clean up of event listener
                            clearTimeout(handle);
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();

                            // now let the application know what happened
                            var return_status = {event_status: code, tx_id: transaction_id_string};
                            if (code !== 'VALID') {
                                console.error('The transaction was invalid, code = ' + code);
                                resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                            } else {
                                console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
                                resolve(return_status);
                            }
                        }, (err) => {
                            //this is the callback if something goes wrong with the event registration or processing
                            reject(new Error('There was a problem with the eventhub ::' + err));
                        });
                    });
                    promises.push(txPromise);

                    console.log('return promise.all()');
                    return Promise.all(promises);
                }).then((results) => {

                console.log('Send transaction promise and event listener promise have completed', results);
                // check the results in the order the promises were added to the promise all list
                if (results && results[0] && results[0].status === 'SUCCESS') {
                    console.log('Successfully sent transaction to the orderer.');
                } else {
                    console.error('Failed to order the transaction. Error code: ' + results[0].status);
                    reject('Failed to order the transaction. Error code: ' + results[0].status);
                }

                if (results && results[1] && results[1].event_status === 'VALID') {
                    console.log('Successfully committed the change to the ledger by the peer');
                    resolve(results);
                } else {
                    console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                    reject('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                }

            })
                .catch((error) => {
                    console.error('An error occurred with the transaction ', error);
                    reject(error);
                });
        });

    }

    private queryChainCodeState(request) {
        const promise = new Promise<any>((resolve, reject) => {
            this.channel.queryByChaincode(request)
                .then((query_responses) => {
                    console.log('query_responses', query_responses);

                    if (query_responses && query_responses.length == 1) {
                        if (query_responses[0] instanceof Error) {
                            console.error('error from query = ', query_responses[0]);
                            reject(query_responses[0]);
                        } else {
                            console.log('Response is ', query_responses[0].toString());
                        }
                    } else {
                        console.log('No payloads were returned from query');
                        reject(query_responses[0]);

                    }
                    resolve(JSON.parse(query_responses[0].toString()));
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                })
        });
        return promise;
    }


}