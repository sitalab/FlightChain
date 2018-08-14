# Flight Chain ChainCode

## About
This folder contains the smart contract chaincode that is deployed on the Hyperledger Fabric network.
The code is written in typescript, and it is assumed you are comfotable using node & npm.

The typical lifecycle developing locally is to make modifications to the code in (src)[./src], test the code (`npm run test:w`), 
and then use the `deployChainCode.sh` script to deploy the new version of your chaincode onto your local network.


**Note** You cannot run the chaincode directly with node. Look at the **Deploying chaincode** section for info on 
how to deploy your code so it is executable.


## Pre-requisets

Install node (v8.9.x) and npm.  **Note** Node v9 doesn't currently work with Hyperledger Fabric 1.2

Run `npm install` to install the node_modules.

## Testing chaincode.

Run `npm run test:w` to enter into watch mode testing the chaincode on each file edit.


## Deploying chaincode locally

There is a demo local fabric network in [sita-basic-network](../sita-basic-network). This script will instantiate
that network and deploy the chaincode onto it. 

Run `./deployChainCode.sh -v 1.0 -n flightchain` to rebuild the network and redeploy the chaincode.

> **Note** if you re-use an existing version number then the docker image will not be rebuilt and your newly changed
code will not be deployed onto the network - you'll simply redeploy the old code. 


> **NOTE** After you run this command, the network should be running with the chain code deployed.

Run `docker ps` and the output should look like this:

```
KOS:sita-basic-network kosullivan$ docker ps
CONTAINER ID        IMAGE                                                                                                         COMMAND                  CREATED             STATUS              PORTS                                            NAMES
75498c0ec022        dev-peer0.sandbox.sita.aero-flightchain-1.0-eac96bdc71e9c8d714c5dfe56d2727336899f17f72b8caec6276619c1677fd33   "/bin/sh -c 'cd /usr…"   About an hour ago   Up About an hour                                                     dev-peer0.sandbox.sita.aero-flightchain-1.0
f149a5fc5a62        hyperledger/fabric-peer                                                                                       "peer node start"        About an hour ago   Up About an hour    0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.sandbox.sita.aero
09f80e2b8b21        hyperledger/fabric-ca                                                                                         "sh -c 'fabric-ca-se…"   About an hour ago   Up About an hour    0.0.0.0:7054->7054/tcp                           ca.sita.aero
8c8e6c17db38        hyperledger/fabric-orderer                                                                                    "orderer"                About an hour ago   Up About an hour    0.0.0.0:7050->7050/tcp                           orderer.sita.aero
dd7157e180bf        hyperledger/fabric-tools                                                                                      "/bin/bash"              About an hour ago   Up About an hour                                                     cli
2c81a09874aa        hyperledger/fabric-couchdb                                                                                    "tini -- /docker-ent…"   About an hour ago   Up About an hour    4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
```
