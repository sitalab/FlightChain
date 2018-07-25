# Flight Chain ChainCode

## About
This folder contains the smart contract chaincode that is deployed on the Hyperledger Fabric network.

The code is written in typescript.

## Pre-requisets

Run `npm install` to install the node_modules.

## Building / Testing chaincode.

Run `npm run test:w` to enter into watch mode testing the chaincode on each file edit.


## Deploying chaincode locally

Run `./deployChainCode.sh -v 1.0 -n flightchain` to rebuild the network and redeploy the chaincode.

*Note* if you re-use an existing version number then the docker image will not be rebuilt and your newly changed
code will not be deployed onto the network - you'll simply redeploy the old code. 