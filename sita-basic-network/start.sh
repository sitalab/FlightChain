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

COUNTER=1
MAX_RETRY=5

# import utils
. ./utils.sh

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca.sita.aero orderer.sita.aero peer0.sandbox.sita.aero peer1.sandbox.sita.aero couchdb cli

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
sleep ${FABRIC_START_TIMEOUT}


createChannel "channel-flight-chain-mia"
createChannel "channel-flight-chain"

# Join peer0.sandbox.sita.aero to the channel.
joinChannelWithRetry "channel-flight-chain" "peer0.sandbox.sita.aero:7051"

# Join peer1.sandbox.sita.aero to the channel.
joinChannelWithRetry "channel-flight-chain" "peer1.sandbox.sita.aero:7051"



# Join peer0.sandbox.sita.aero to the channel.
joinChannelWithRetry "channel-flight-chain-mia" "peer0.sandbox.sita.aero:7051"

# Join peer1.sandbox.sita.aero to the channel.
joinChannelWithRetry "channel-flight-chain-mia" "peer1.sandbox.sita.aero:7051"




echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Your local basic network should now be running, and you should see 6 docker images"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""

docker ps