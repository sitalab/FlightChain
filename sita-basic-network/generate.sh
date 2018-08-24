#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}

# Channel name contain only lowercase alpha numerics, dots and dashes.
CHANNEL_NAME=channel-flight-chain
CHANNEL_NAME_MIA=channel-flight-chain-mia

# remove previous crypto material and config transactions
rm -fr config/*
rm -fr crypto-config/*
mkdir config
mkdir crypto-config

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate channel configuration transaction
configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/$CHANNEL_NAME.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi
# generate channel configuration transaction
configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/$CHANNEL_NAME_MIA.tx -channelID $CHANNEL_NAME_MIA
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/SITAMSPanchors.tx -channelID $CHANNEL_NAME -asOrg SITAMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for SITAMSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/SITAMSPanchors.tx -channelID $CHANNEL_NAME_MIA -asOrg SITAMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for SITAMSP..."
  exit 1
fi


echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Now creating the docker-compose.yml file with the correct CA_PRIVATE_KEY"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"

ARCH=$(uname -s | grep Darwin)
  if [ "$ARCH" == "Darwin" ]; then
    OPTS="-it"
  else
    OPTS="-i"
  fi


cp docker-compose-template.yml docker-compose.yml

CURRENT_DIR=$PWD
cd crypto-config/peerOrganizations/sandbox.sita.aero/ca/
export PRIV_KEY=$(ls *_sk)
cd "$CURRENT_DIR"

sed $OPTS "s/CA_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yml
 if [ "$ARCH" == "Darwin" ]; then
    rm docker-compose.ymlt
  fi



echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Now you can run ./start.sh to bring up the network"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
