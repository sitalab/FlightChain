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
KOS:flight-chain-ui kosullivan$ docker ps
CONTAINER ID        IMAGE                                                                                                          COMMAND                  CREATED              STATUS              PORTS                                            NAMES
d9b1ed5fefee        dev-peer1.sandbox.sita.aero-flightchain-3.0-21e75a3d558c03e0e970addf42d4e53ba22d869d1bc897d9b7d823c981d37fcd   "/bin/sh -c 'cd /usr…"   8 seconds ago        Up 7 seconds                                                         dev-peer1.sandbox.sita.aero-flightchain-3.0
c0b4009944e0        dev-peer0.sandbox.sita.aero-flightchain-3.0-b7b1b6748265eb50c35d538932b1eaa68f4e40425613204d4f3ecd54f681e900   "/bin/sh -c 'cd /usr…"   41 seconds ago       Up 40 seconds                                                        dev-peer0.sandbox.sita.aero-flightchain-3.0
d48a726cd14b        hyperledger/fabric-peer                                                                                        "peer node start"        About a minute ago   Up About a minute   0.0.0.0:8051->7051/tcp, 0.0.0.0:8053->7053/tcp   peer1.sandbox.sita.aero
023387d7ca0f        hyperledger/fabric-peer                                                                                        "peer node start"        About a minute ago   Up About a minute   0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.sandbox.sita.aero
8a47926217ac        hyperledger/fabric-couchdb                                                                                     "tini -- /docker-ent…"   About a minute ago   Up About a minute   4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
aff801facf97        hyperledger/fabric-tools                                                                                       "/bin/bash"              About a minute ago   Up About a minute                                                    cli
6ea5f904fcc8        hyperledger/fabric-ca                                                                                          "sh -c 'fabric-ca-se…"   About a minute ago   Up About a minute   0.0.0.0:7054->7054/tcp                           ca.sita.aero
38e17797c4d2        hyperledger/fabric-orderer                                                                                     "orderer"                About a minute ago   Up About a minute   0.0.0.0:7050->7050/tcp                           orderer.sita.aero
```
