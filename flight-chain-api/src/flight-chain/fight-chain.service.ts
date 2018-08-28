import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AcrisFlight} from '../acris-schema/AcrisFlight';
import {ChaincodeInvokeRequest, ChaincodeQueryRequest, ProposalResponseObject, TransactionRequest} from 'fabric-client';
import Client = require('fabric-client');

const Fabric_Client = require('fabric-client');
const path = require('path');
const util = require('util');
const os = require('os');

@Injectable()
export class FlightChainService {
    private readonly flights: AcrisFlight[] = [];

    private fabric_client = null;
    private channels: Client.Channel[] = [];
    private member_user;

    // TODO - should channel name be env or API param, or other?
    private username = process.env.IDENTITY;
    private channelNames = ['channel-flight-chain', 'channel-flight-chain-mia'];
    private peerEndpoints: string[] = ['grpc://localhost:7051', 'grpc://localhost:8051'];
    private ordererEndpoint = 'grpc://localhost:7050';
    private eventHubEndpoint = 'grpc://localhost:7053';

    constructor() {
        this.fabric_client = this.initFabricClient();
        this.channelNames.forEach((channel: string) => {
            this.channels[channel] = this.createChannel(channel, this.peerEndpoints, this.ordererEndpoint);
        });
    }

    /**
     * Create a fabric client and load the local user certificates for it.
     *
     * TODO - what is the best way to create, send, store certificates in future ?
     *
     */
    private initFabricClient() {
        const store_path = path.join('./bootstrap/', 'hfc-key-store');
        console.log('Store path:' + store_path);

        const fabric_client = new Fabric_Client();

        // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
        Fabric_Client.newDefaultKeyValueStore({
            path: store_path,
        }).then((state_store) => {
            // assign the store to the fabric client
            fabric_client.setStateStore(state_store);
            const crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return fabric_client.getUserContext(this.username, true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded ' + this.username + ' from persistence');
            } else {
                console.error(`Failed to get the identity ${this.username}.... Did you run 'node bootstrap/enrollAdmin.js && node bootstrap/registerUser.js  ${this.username}'`);
                process.exit(1);
            }
        });

        return fabric_client;
    }

    /**
     * Create the channel on this API.
     *
     * TODO - should channel name be env or API param?
     * TODO - change Peers & Orderers to env variable
     *
     * @param channelName
     * @param peerEndpoints
     * @param ordererEndpoint
     */
    private createChannel(channelName: string, peerEndpoints: string[], ordererEndpoint: string): Client.Channel {
        console.log(`Creating new channel '${channelName}'...`);
        const channel: Client.Channel = this.fabric_client.newChannel(channelName);

        peerEndpoints.forEach(peer => {
            console.log(`Adding peer endpoint '${peer}' to this channel...`);
            channel.addPeer(this.fabric_client.newPeer(peer));
        });
        console.log(`Adding orderer '${ordererEndpoint}' to this channel...`);
        channel.addOrderer(this.fabric_client.newOrderer(ordererEndpoint));
        return channel;
    }

    /**
     * Find the flight matching the given flight key.
     *
     * @param channelName - name of the channel to execute this command on
     * @param flightKey
     */
    public async findOneFlight(channelName: string, flightKey: string): Promise<AcrisFlight> {

        console.log(`FlightChainService.findOneFlight('${channelName}', '${flightKey}')`);

        this.validateChannel(channelName);
        const request = {
            // targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'flightchain',
            fcn: 'getFlight',
            args: [flightKey],
        };

        return this.queryChainCodeState(this.channels[channelName], request);
    }

    /**
     * Find the flight history for the given flight key. The history is the list of all
     * past changes to the dat.
     *
     * @param channelName - name of the channel to execute this command on
     * @param flightKey
     */
    public async findFlightHistory(channelName: string, flightKey: any): Promise<AcrisFlight> {
        console.log(`FlightChainService.findFlightHistory('${channelName}', ${flightKey}')`);
        this.validateChannel(channelName);
        const request: ChaincodeInvokeRequest = {
            // targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'flightchain',
            fcn: 'getFlightHistory',
            args: [flightKey],
            txId: undefined,
        };
        return this.queryChainCodeState(this.channels[channelName], request);

    }

    /**
     * Create a new flight on the blockchain.
     *
     * @param channelName - name of the channel to execute this command on
     * @param flight
     */
    public async createFlight(channelName: string, flight: AcrisFlight): Promise<any> {
        console.log(`FlightChainService.createFlight(\'${channelName}\')`);
        this.validateChannel(channelName);
        // get a transaction id object based on the current user assigned to fabric client
        const tx_id = this.fabric_client.newTransactionID();

        // must send the proposal to endorsing peers
        const request: ChaincodeInvokeRequest = {
            // targets: let default to the peer assigned to the client
            chaincodeId: 'flightchain',
            fcn: 'createFlight',
            args: [JSON.stringify(flight)],
            // chainId: 'channel-flight-chain',
            txId: tx_id,
            // proposalResponses: null,
            // proposal: null
        };
        return this.commitTransaction(this.channels[channelName], request);
    }

    /**
     * Update an existing flight on the blockchain.
     *
     * @param channelName - name of the channel to execute this command on
     * @param flightKey
     * @param flightDelta
     */
    public async updateFlight(channelName: string, flightKey: string, flightDelta: AcrisFlight): Promise<AcrisFlight> {
        console.log(`FlightChainService.updateFlight('${channelName}', '${flightKey}')`);
        this.validateChannel(channelName);
        // get a transaction id object based on the current user assigned to fabric client
        const tx_id = this.fabric_client.newTransactionID();
        console.log('Assigning transaction_id: ', tx_id._transaction_id);

        // must send the proposal to endorsing peers
        const request: ChaincodeInvokeRequest = {
            // targets: let default to the peer assigned to the client
            chaincodeId: 'flightchain',
            fcn: 'updateFlight',
            args: [flightKey, JSON.stringify(flightDelta)],
            txId: tx_id
        };
        return this.commitTransaction(this.channels[channelName], request);

    }

    /**
     * Get the transaction details for the given transaction id.
     *
     * @param channelName - name of the channel to execute this command on
     * @param transactionId
     */
    public async getTransactionInfo(channelName: string, transactionId: string): Promise<AcrisFlight> {
        console.log(`FlightChainService.getTransactionInfo('${channelName}', '${transactionId}')`);
        this.validateChannel(channelName);
        const transactionInfo: any = await this.channels[channelName].queryTransaction(transactionId).catch((err: Error) => {
            console.error('error getting transaction id', err);
            if (err.message.indexOf('Entry not found in index') >= 0) {
                throw new HttpException(err.message, HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
        return transactionInfo;
    }

    /**
     * Execute a transaction that will update the blockchain state.
     *
     * @param channel - the channel to execute the query command on.
     * @param {Client.ChaincodeInvokeRequest} transactionProposalRequest
     * @returns {Promise<any>}
     */
    private async commitTransaction(channel: Client.Channel, transactionProposalRequest: ChaincodeInvokeRequest): Promise<any> {

        /**
         * Send the transaction to the consensus nodes and wait for response.
         */
        const sendTransactionProposalTimingLabel = 'sendTransactionProposal-' + transactionProposalRequest.txId.getTransactionID();
        console.time(sendTransactionProposalTimingLabel);
        const sendTransactionProposalResults: ProposalResponseObject =
            await channel.sendTransactionProposal(transactionProposalRequest).catch((err: Error) => {
                console.error('sendTransactionProposal', err);
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
            });
        console.timeEnd(sendTransactionProposalTimingLabel);

        /**
         * Check that we have the appropriate number of proposal responses
         */
            // console.log('sendTransactionProposalResults', sendTransactionProposalResults);

        const proposalResponses: Array<Client.ProposalResponse> = sendTransactionProposalResults[0];
        const proposal: Client.Proposal = sendTransactionProposalResults[1];
        let isProposalGood = false;

        console.log(`got ${proposalResponses.length} proposal results`);
        proposalResponses.forEach((response: Client.ProposalResponse) => {
            console.log(response.response);
        });

        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
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
            const msg = 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
            console.error(msg);
            throw new HttpException(msg, HttpStatus.BAD_REQUEST);
        }

        console.log(util.format(
            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - \'%s\'',
            proposalResponses[0].response.status, proposalResponses[0].response.message));

        const transactionRequest: TransactionRequest = {
            proposalResponses: proposalResponses,
            proposal: proposal,
        };

        // set the transaction listener and set a timeout of 30 sec
        // if the transaction did not get committed within the timeout period,
        // report a TIMEOUT status
        // Get the transaction ID string to be used by the event processing
        const transaction_id_string = transactionProposalRequest.txId.getTransactionID();

        const sendTransactionTimingLabel = 'sendTransaction-' + transactionProposalRequest.txId.getTransactionID();
        console.time(sendTransactionTimingLabel);
        const sendTransactionResponse = await channel.sendTransaction(transactionRequest).catch((err: Error) => {
            console.log(err);
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });
        console.timeEnd(sendTransactionTimingLabel);

        console.log('sendTransactionResponse', sendTransactionResponse);
        if (sendTransactionResponse.status !== 'SUCCESS') {
            console.log('sendTransactionResponse failed');
            throw new HttpException('sendTransactionResponse failed', HttpStatus.BAD_REQUEST);
        }

        // get an eventhub once the fabric client has a user assigned. The user
        // is required bacause the event registration must be signed
        const event_hub = this.fabric_client.newEventHub();
        event_hub.setPeerAddr(this.eventHubEndpoint);

        // using resolve the promise so that result status may be processed
        // under the then clause rather than having the catch clause process
        // the status
        const txPromise = new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                event_hub.disconnect();
                reject(new HttpException('Transaction did not complete within 3 seconds', HttpStatus.REQUEST_TIMEOUT));
            }, 3000);
            const eventHubConnectimingLabel = 'eventHubConnect-' + transactionProposalRequest.txId.getTransactionID();
            console.time(eventHubConnectimingLabel);
            event_hub.connect();
            console.timeEnd(eventHubConnectimingLabel);

            const eventHubRegisterTxEventtimingLabel = 'eventHubRegisterTxEvent-' + transactionProposalRequest.txId.getTransactionID();
            console.time(eventHubRegisterTxEventtimingLabel);
            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {

                console.timeEnd(eventHubRegisterTxEventtimingLabel);

                // this is the callback for transaction event status
                // first some clean up of event listener
                clearTimeout(handle);
                event_hub.unregisterTxEvent(transaction_id_string);
                event_hub.disconnect();

                // now let the application know what happened
                const return_status: any = {event_status: code, tx_id: transaction_id_string};
                if (code !== 'VALID') {
                    console.error('The transaction was invalid, code = ' + code);
                    reject(new HttpException('Problem with the tranaction, event status ::' + code, HttpStatus.INTERNAL_SERVER_ERROR));
                } else {
                    console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
                    resolve(return_status);
                }
            }, (err) => {
                // this is the callback if something goes wrong with the event registration or processing
                reject(new HttpException('There was a problem with the eventhub ::' + err, HttpStatus.INTERNAL_SERVER_ERROR));
            });
        });

        const event_hubResponse: any = await txPromise;
        console.log('event_hubResponse', event_hubResponse);

        if (event_hubResponse.event_status !== 'VALID') {
            throw new HttpException(event_hubResponse, HttpStatus.BAD_REQUEST);
        }

        return event_hubResponse;
    }

    /**
     * Read the state value from the blockchain.
     *
     * @param channel - the channel to execute the query command on.
     * @param request
     */
    private async queryChainCodeState(channel: Client.Channel, request: ChaincodeQueryRequest): Promise<AcrisFlight> {

        const query_responses: Buffer[] = await channel.queryByChaincode(request).catch((err: Error) => {
            console.error('queryByChaincode', err);
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        });

        /**
         * TODO: Implement handling for multiple responses from multiple peers.  Can we just take the response at query_response[0] ?
         */
        if (query_responses && query_responses.length >= 1) {
            if (query_responses[0] instanceof Error) {
                console.error('error from query = ', query_responses[0]);
                throw new HttpException(query_responses[0], HttpStatus.INTERNAL_SERVER_ERROR);
            } else {

                if (query_responses[0].toString().length === 0 || query_responses[0].toString() === '[]') {
                    throw new HttpException(`No matching flight for flightKey`, HttpStatus.NOT_FOUND);
                } else {
                    // console.log('Response is ', query_responses[0].toString());
                }
            }
        } else {
            console.error('No payloads were returned from query', query_responses);
            throw new HttpException(query_responses[0], HttpStatus.NOT_FOUND);
        }
        return JSON.parse(query_responses[0].toString());
    }

    /**
     * Verify that the specified channel name exists.
     *
     * @throws HttpException 400 error if it does not.
     */
    private validateChannel(channelName: string) {
        if (!this.channels[channelName]) {
            throw new HttpException(`There is no channel setup with channelName ${channelName}`, HttpStatus.BAD_REQUEST);
        }
    }
}
