#!/bin/bash


# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

# NODE_SRC_PATH *must* point to the dirctory that contains the package.json and the chaincode
NODE_SRC_PATH=/etc/hyperledger/allorgs/FlightChain/chaincode
cd $NODE_SRC_PATH

#
# Extract the command line arguments
#
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
			CHANNEL_NAME="$2"
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
set -- "${POSITIONAL[@]}" # restore positional parameters



echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo "This script will deploy the chaincode onto a local network."
echo "It will stop any existing network, then restart it per the config in ../sita-basic-network."
echo ""

if [[ -n "${CHAINCODEVERSION/[ ]*\n/}" ]]
then
    echo CHAINCODEVERSION  = "${CHAINCODEVERSION}"
else
    echo "you must specify the chain code version number (e.g. $0 -v 1.2 -n flightchain)"
    exit 1;
fi

if [[ -n "${CHAINCODENAME/[ ]*\n/}" ]]
then
    echo CHAINCODENAME     = "${CHAINCODENAME}"
else
    echo "you must specify the chain code name (e.g. $0 -v 1.2 -n flightchain)"
    exit 1;
fi

if [[ -n "${CHANNEL_NAME/[ ]*\n/}" ]]
then
    echo CHANNEL_NAME  = "${CHANNEL_NAME}"
else
    echo "you must specify the channel name (e.g. $0 -c mychannel)"
    exit 1;
fi

if [ -d "node_modules" ]; then
    echo "Assuming node_modules is up to date, skipping 'npm install'"
    echo ""
else
    echo ""
    echo "Installing node_modules ..."
    echo ""
    npm install
fi

# set environment variables
export CORE_PEER_LOCALMSPID=sitaus
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/allorgs/keyfiles/sitaus/users/Admin@sitaus/msp
export CORE_PEER_ID=peer1st-sitaus
export CORE_PEER_ADDRESS=peer1st-sitaus:7051

echo "Compiling & testing the chaincode typescript to javascript"
npm run clean
npm run build

LANGUAGE="node"

# NODE_SRC_PATH *must* point to the dirctory that contains the package.json and the chaincode
NODE_SRC_PATH=/etc/hyperledger/allorgs/FlightChain/chaincode

echo "INSTALL ${CHAINCODENAME} ${CHAINCODEVERSION}"
peer chaincode install -n $CHAINCODENAME -v $CHAINCODEVERSION -p "$NODE_SRC_PATH" -l "$LANGUAGE"

CHANNEL_NAME="firstchannel"

echo "INSTANTIATE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME}"
peer --logging-level debug chaincode instantiate -o orderer1st-sita:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -v $CHAINCODEVERSION -l "$LANGUAGE" -c '{"Args":[""]}' -P "OR ('sitaus.peer','sitaeu.peer')"

echo "INVOKE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME}"
peer chaincode invoke -o orderer1st-sita:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -c '{"function":"initLedger","Args":[""]}'
