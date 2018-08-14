#!/bin/bash

# Extract command line args
POSITIONAL=()
while [[ $# -gt 0 ]]
do
	key="$1"
	case $key in
		-v | --version)
			CHAINCODEVERSION="$2"
			shift # past argument
			shift # past value
			;;

		-n | --chaincodename)
			CHAINCODENAME="$2"
			shift # past argument
			shift # past value
			;;

		-c | --channel)
			CHANNEL="$2"
			shift
			shift
			;;
		*)
		# unknown option
		 POSITIONAL+=("$1") # save it in an array for later
		 shift # past argument
		 ;;

esac
done
# restore positional params
set -- "${POSITIONAL[@]}"

echo "======================================================================================="
echo "+			This script  will upgrade the chaincode		              +"
echo "+		The chaincode name must match the chaincode being upgraded	      +"
echo "+			or else it will be seen as a new chaincode.                   +"
echo "======================================================================================="

# check for chaincode version
if [[ -n "${CHAINCODEVERSION/[ ]*\n/}" ]]
then
	echo CHAINCODEVERSION  = "${CHAINCODEVERSION}"
else
	echo "you must specify the chain code version number (e.g. $0 -v 1.2)"
	exit 1;
fi

# check for chaincode name
if [[ -n "${CHAINCODENAME/[ ]*\n/}" ]]
then
	echo CHAINCODENAME     = "${CHAINCODENAME}"
else
	echo "you must specify the chain code name (e.g. $0 -n flightchain)"
	exit 1;
fi

# check for channel
if [[ -n "${CHANNEL/[ ]*\n/}" ]]
then
	echo CHANNEL	= "${CHANNEL}"
else
	echo "you must specify the channel"
	exit 1;
fi

LANGUAGE="node"
NODE_SRC_PATH=/opt/src/node

# install chaincode
echo "INSTALL ${CHAINCODENAME} ${CHAINCODEVERSION}"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n $CHAINCODENAME -v $CHAINCODEVERSION -p "$NODE_SRC_PATH" -l "$LANGUAGE"

# upgrade chaincode
echo "UPGRADE ${CHAINCODENAME} to version ${CHAINCODEVERSION}"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"   cli peer chaincode upgrade --logging-level debug -n $CHAINCODENAME -v $CHAINCODEVERSION -p "$NODE_SRC_PATH" -C $CHANNEL -o orderer.example.com:7050 -c '{"function":"initLedger","Args":[""]}'  -p "$NODE_SRC_PATH" -l "$LANGUAGE"

