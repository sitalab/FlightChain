#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca.sita.aero orderer.sita.aero peer0.sandbox.sita.aero couchdb cli

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" peer0.sandbox.sita.aero peer channel create -o orderer.sita.aero:7050 -c channel-flight-chain -f /etc/hyperledger/configtx/channel.tx
# Join peer0.sandbox.sita.aero to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" peer0.sandbox.sita.aero peer channel join -b channel-flight-chain.block


echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Your local basic network should now be running, and you should see 5 docker images"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""

docker ps