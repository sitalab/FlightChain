import {Get, Controller, Param, HttpStatus, Post, Body, HttpException, Patch, Query} from '@nestjs/common';
import {FlightChainService} from './fight-chain.service';
import {AcrisFlight} from '../acris-schema/AcrisFlight';
import {ApiImplicitBody, ApiImplicitParam, ApiOperation, ApiResponse, ApiUseTags, ApiImplicitQuery} from '@nestjs/swagger';


export enum ChannelNames {
    Default = 'channel-flight-chain',
    MIA = 'channel-flight-chain-mia'
}

@ApiUseTags('FlightChain')
@Controller()
export class FlightChainController {
    constructor(private readonly flightChainService: FlightChainService) {
    }

    @ApiOperation({
        title: 'Get one flight',
        description: 'Returns the live state of the flight identified by flightKey'
    })
    @ApiImplicitParam({
        name: 'flightKey',
        type: 'string',
        required: true,
        description: 'Unique key for each flight. The key is made up of [DepDate][DepAirport][OperatingAirline][OperatingFlightNum]. e.g. 2018-07-22LGWBA0227'
    })
    @ApiImplicitQuery({
        name: 'channelName',
        // enum: [DEFAULT_CHANNEL_NAME, CHANNEL_NAME_MIA],
        type: 'string',
        required: false,
        description: 'Name of the fabric channel to execute this transaction on. Defaults to ' + ChannelNames.Default,

    })
    @Get('/:flightKey')
    @ApiResponse({status: 200, description: 'The flight has been successfully returned.'})
    @ApiResponse({status: 404, description: 'Not flight matching the given flightKey has been found.'})
    public async getOneFlight(
        @Param('flightKey') flightKey,
        @Query('channelName') channelName: ChannelNames = ChannelNames.Default): Promise<AcrisFlight> {
        console.log(`FlightChainController.getOneFlight(channelName=${channelName}, flightKey=${flightKey})`);
        return this.flightChainService.findOneFlight(channelName, flightKey);
    }


    @ApiOperation({
        title: 'Get flight history',
        description: 'Returns the history of udpates for the flight identified by flightKey'
    })
    @ApiImplicitParam({
        name: 'flightKey',
        type: 'string',
        required: true,
        description: 'Unique key for each flight. The key is made up of [DepDate][DepAirport][OperatingAirline][OperatingFlightNum]. e.g. 2018-07-22LGWBA0227'
    })
    @ApiImplicitQuery({
        name: 'channelName',
        // enum: [DEFAULT_CHANNEL_NAME, CHANNEL_NAME_MIA],
        type: 'string',
        required: false,
        description: 'Name of the fabric channel to execute this transaction on. Defaults to ' + ChannelNames.Default,

    })
    @Get('/:flightKey/history')
    @ApiResponse({status: 200, description: 'The flight has been successfully returned.'})
    @ApiResponse({status: 404, description: 'Not flight matching the given flightKey has been found.'})
    public async getFlightHIstory(
        @Param('flightKey') flightKey,
        @Query('channelName') channelName: ChannelNames = ChannelNames.Default): Promise<AcrisFlight> {
        console.log(`FlightChainController.getFlightHIstory(channelName=${channelName}, flightKey=${flightKey})`);
        return this.flightChainService.findFlightHistory(channelName, flightKey);
    }


    @ApiOperation({title: 'Create new flight on the network'})
    @ApiResponse({
        status: 201,
        description: 'The flight record has been successfully created.',
    })
    @ApiImplicitQuery({
        name: 'channelName',
        // enum: [DEFAULT_CHANNEL_NAME, CHANNEL_NAME_MIA],
        type: 'string',
        required: false,
        description: 'Name of the fabric channel to execute this transaction on. Defaults to ' + ChannelNames.Default,
    })
    @Post()
    public async createFlight(
        @Body() flight: AcrisFlight,
        @Query('channelName') channelName: ChannelNames = ChannelNames.Default): Promise<AcrisFlight> {
        console.log(`FlightChainController.createFlight(channelName=${channelName})`);

        const flightCreated: AcrisFlight = await this.flightChainService.createFlight(channelName, flight);
        if (flightCreated === undefined) {
            throw new HttpException('Invalid flight', HttpStatus.BAD_REQUEST);
        }
        return flightCreated;
    }


    @ApiOperation({title: 'Get transaction info', description: 'Returns the details of a given transaction'})
    @ApiImplicitParam({
        name: 'transactionId',
        type: 'string',
        required: true,
        description: 'Transaction Id returned after every flight creation or update.'
    })
    @ApiImplicitQuery({
        name: 'channelName',
        // enum: [DEFAULT_CHANNEL_NAME, CHANNEL_NAME_MIA],
        type: String,
        required: false,
        description: 'Name of the fabric channel to execute this transaction on. Defaults to ' + ChannelNames.Default,

    })
    @Get('/transaction/:transactionId')
    @ApiResponse({status: 200, description: 'The transaction info has been successfully returned.'})
    @ApiResponse({status: 404, description: 'Not transaction info matching the given transactionId has been found.'})
    @ApiResponse({status: 500, description: 'Unknown internal server error.'})
    public async getTransactionInfo(
        @Param('transactionId') transactionId,
        @Query('channelName') channelName: ChannelNames = ChannelNames.Default): Promise<AcrisFlight> {
        console.log(`FlightChainController.getTransactionInfo(channelName=${channelName}, transactionId=${transactionId})`);
        return this.flightChainService.getTransactionInfo(channelName, transactionId);
    }


    @ApiOperation({title: 'Update an existing flight on the network'})
    @ApiResponse({
        status: 201,
        description: 'The flight record has been successfully updated.',
    })
    @ApiImplicitParam({
        name: 'flightKey',
        type: 'string',
        required: true,
        description: 'Unique key for each flight. The key is made up of [DepDate][DepAirport][OperatingAirline][OperatingFlightNum]. e.g. 2018-07-22LGWBA0227'
    })
    @ApiImplicitQuery({
        name: 'channelName',
        // enum: [DEFAULT_CHANNEL_NAME, CHANNEL_NAME_MIA],
        type: String,
        required: false,
        description: 'Name of the fabric channel to execute this transaction on. Defaults to ' + ChannelNames.Default,

    })
    @Patch('/:flightKey')
    public async updateFlight(
        @Param('flightKey') flightKey, @Body() flight: AcrisFlight,
        @Query('channelName') channelName: ChannelNames = ChannelNames.Default): Promise<AcrisFlight> {
        console.log(`FlightChainController.updateFlight(channelName=${channelName}, flightKey=${flightKey})`);
        return this.flightChainService.updateFlight(channelName, flightKey, flight);
    }
}
