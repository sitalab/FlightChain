import shim = require('fabric-shim');
import { FlightChain } from './flightChain';

// FlightChain Chaincode is moved to seperate file for testing
shim.start(new FlightChain());
