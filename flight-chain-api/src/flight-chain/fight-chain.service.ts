import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AcrisFlight} from '../acris-schema/AcrisFlight';
import {ChaincodeInvokeRequest, TransactionRequest} from "fabric-client";

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

    // TODO - should channel name be env or API param, or other?
    private username = 'BA';

    private channelName = 'mychannel';
    private peerEndpoints: string[] = ['grpc://localhost:7051'];
    private ordererEndpoint  = 'grpc://localhost:7050';

    constructor() {

        this.fabric_client = new Fabric_Client();
        // TODO - should channel name be env or API param?
        this.channel = this.fabric_client.newChannel(this.channelName);
        // TODO - change to env variable
        this.peerEndpoints.forEach(peer => {
            console.log('Adding peer endpoing '+peer);
            this.channel.addPeer(this.fabric_client.newPeer(peer));
        });
        this.channel.addOrderer(this.fabric_client.newOrderer(this.ordererEndpoint));

        var store_path = path.join('/Users/kosullivan/Dev/Blockchain2/fabric-samples/fabcar/', 'hfc-key-store');
        console.log('Store path:' + store_path);

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
            return this.fabric_client.getUserContext(this.username, true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded ' + this.username + ' from persistence');
            } else {
                throw new Error('Failed to get ' + this.username + '.... run registerUser.js');
            }
        })

    }


    public async findOne(flightKey: string): Promise<AcrisFlight> {

        console.log('FlightChainService.findOne()', flightKey);
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
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'flightchain',
            fcn: 'getFlightHistory',
            args: [flightKey]
        };
        return this.queryChainCodeState(request);

    }



    public async createFlight(flight: AcrisFlight): Promise<any> {
        console.log('FlightChainService.createFlight()');

        // get a transaction id object based on the current user assigned to fabric client
        let tx_id = this.fabric_client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);

        // must send the proposal to endorsing peers
        let request:ChaincodeInvokeRequest = {
            //targets: let default to the peer assigned to the client
            chaincodeId: 'flightchain',
            fcn: 'createFlight',
            args: [JSON.stringify(flight)],
            // chainId: 'mychannel',
            txId: tx_id,
            // proposalResponses: null,
            // proposal: null
        };
        return this.commitTransaction(request);
    }
    public async updateFlight(flightKey: string, flightDelta: AcrisFlight): Promise<AcrisFlight> {
        console.log('FlightChainService.updateFlight()');

        // get a transaction id object based on the current user assigned to fabric client
        let tx_id = this.fabric_client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);

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
        return this.commitTransaction(request);

    }


    /**
     *
     * @param {Client.ChaincodeInvokeRequest} transactionProposalRequest
     * @returns {Promise<any>}
     */
    private async commitTransaction(transactionProposalRequest:ChaincodeInvokeRequest): Promise<any> {



        var sendTransactionProposalResults = await this.channel.sendTransactionProposal(transactionProposalRequest).catch((err) => {
            console.error('sendTransactionProposal', err);
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });

        let proposalResponses = sendTransactionProposalResults[0];
        let proposal = sendTransactionProposalResults[1];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('Transaction proposal was good');
        } else {
            let msg = null;
            if (!proposalResponses[0].response.message) {
                msg = 'Transaction proposal was bad, unknown error';
            } else {
                msg = proposalResponses[0].response.message;
            }
            console.log(proposalResponses[0]);
            console.log('payload', proposalResponses[0].response.payload);
            console.log('payload', proposalResponses[0].response.payload.toString('utf8'));
            console.error(msg);
            throw new HttpException(msg, HttpStatus.BAD_REQUEST);
            // return new Promise<any>((resolve, reject) => { reject(msg); });
        }
        if (!isProposalGood) {
            let msg = 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
            console.error(msg);
            // throw new Error(msg)
            throw new HttpException(msg, HttpStatus.BAD_REQUEST);
            // return new Promise<any>((resolve, reject) => { reject(msg); });
        }

        console.log(util.format(
            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
            proposalResponses[0].response.status, proposalResponses[0].response.message));

        let transactionRequest: TransactionRequest = {
            proposalResponses: proposalResponses,
            proposal: proposal
        }

        // set the transaction listener and set a timeout of 30 sec
        // if the transaction did not get committed within the timeout period,
        // report a TIMEOUT status
        let transaction_id_string = transactionProposalRequest.txId.getTransactionID(); //Get the transaction ID string to be used by the event processing

        let sendTransactionResponse = await this.channel.sendTransaction(transactionRequest).catch((err) => {
            console.log(err);
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
        console.log('sendTransactionResponse', sendTransactionResponse);
        if (sendTransactionResponse.status !== 'SUCCESS') {
            console.log('sendTransactionResponse failed');
            throw new HttpException('sendTransactionResponse failed', HttpStatus.BAD_REQUEST);

        }


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
                reject(new HttpException('Trnasaction did not complete within 3 seconds', HttpStatus.REQUEST_TIMEOUT));
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
                let return_status: any = {event_status: code, tx_id: transaction_id_string};
                if (code !== 'VALID') {
                    console.error('The transaction was invalid, code = ' + code);
                    reject(new HttpException('Problem with the tranaction, event status ::' + code, HttpStatus.INTERNAL_SERVER_ERROR));
                } else {
                    console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
                    resolve(return_status);
                }
            }, (err) => {
                //this is the callback if something goes wrong with the event registration or processing
                reject(new HttpException('There was a problem with the eventhub ::' + err, HttpStatus.INTERNAL_SERVER_ERROR));
            });
        });

        let event_hubResponse: any = await txPromise;
        console.log('event_hubResponse', event_hubResponse);

        if (event_hubResponse.event_status !== 'VALID') {
            throw new HttpException(event_hubResponse, HttpStatus.BAD_REQUEST)
        }

        return event_hubResponse;
    }

    private queryChainCodeState(request) {
        return  new Promise<any>((resolve, reject) => {
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
    }
}