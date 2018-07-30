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

> **Note** if you re-use an existing version number then the docker image will not be rebuilt and your newly changed
code will not be deployed onto the network - you'll simply redeploy the old code. 


> **NOTE** After you run this command, the network should be running with the chain code deployed.

Run `docker ps` and the output should look like this:

```
KOS:sita-basic-network kosullivan$ docker ps
CONTAINER ID        IMAGE                                                                                                         COMMAND                  CREATED             STATUS              PORTS                                            NAMES
75498c0ec022        dev-peer0.org1.example.com-flightchain-1.0-eac96bdc71e9c8d714c5dfe56d2727336899f17f72b8caec6276619c1677fd33   "/bin/sh -c 'cd /usr…"   About an hour ago   Up About an hour                                                     dev-peer0.org1.example.com-flightchain-1.0
f149a5fc5a62        hyperledger/fabric-peer                                                                                       "peer node start"        About an hour ago   Up About an hour    0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
09f80e2b8b21        hyperledger/fabric-ca                                                                                         "sh -c 'fabric-ca-se…"   About an hour ago   Up About an hour    0.0.0.0:7054->7054/tcp                           ca.example.com
8c8e6c17db38        hyperledger/fabric-orderer                                                                                    "orderer"                About an hour ago   Up About an hour    0.0.0.0:7050->7050/tcp                           orderer.example.com
dd7157e180bf        hyperledger/fabric-tools                                                                                      "/bin/bash"              About an hour ago   Up About an hour                                                     cli
2c81a09874aa        hyperledger/fabric-couchdb                                                                                    "tini -- /docker-ent…"   About an hour ago   Up About an hour    4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
```
