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
export CHANNEL_NAME="channel-flight-chain"

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca.sita.aero orderer.sita.aero peer0.sandbox.sita.aero peer1.sandbox.sita.aero couchdb cli

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" peer0.sandbox.sita.aero peer channel create -o orderer.sita.aero:7050 -c $CHANNEL_NAME -f /etc/hyperledger/configtx/channel.tx

# Join peer0.sandbox.sita.aero to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer0.sandbox.sita.aero:7051" peer0.sandbox.sita.aero peer channel join -b $CHANNEL_NAME.block

# Join peer1.sandbox.sita.aero to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer1.sandbox.sita.aero:7051" peer0.sandbox.sita.aero peer channel join -b $CHANNEL_NAME.block


echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Your local basic network should now be running, and you should see 6 docker images"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""

docker ps