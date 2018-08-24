#!/bin/bash


# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1


#
# Extract the command line arguments
#
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -v|--version)
    CHAINCODEVERSION="$2"
    shift # past argument
    shift # past value
    ;;
    -n|--chaincodename)
    CHAINCODENAME="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
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

if [ -d "node_modules" ]; then
    echo "Assuming node_modules is up to date, skipping 'npm install'"
    echo ""
else
    echo ""
    echo "Installing node_modules ..."
    echo ""
    npm install
fi



# launch network; create channel and join peer to channel
cd ../sita-basic-network
./init.sh
./generate.sh
./start.sh
cd -
echo pwd
pwd

echo "Compiling & testing the chaincode typescript to javascript"
npm run clean
npm run build
# npm run test


LANGUAGE="node"

# NODE_SRC_PATH *must* match the chaincode volume mapping in ../sita-basic-network/docker-compose-template.yml, for
# the cli image (- ../chaincode/:/opt/src/node)
NODE_SRC_PATH=/opt/src/node


echo "INSTALL ${CHAINCODENAME} ${CHAINCODEVERSION} on peer1.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer1.sandbox.sita.aero:7051" cli peer chaincode install -n $CHAINCODENAME -v $CHAINCODEVERSION -p "$NODE_SRC_PATH" -l "$LANGUAGE"

echo "INSTALL ${CHAINCODENAME} ${CHAINCODEVERSION} on peer0.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer0.sandbox.sita.aero:7051" cli peer chaincode install -n $CHAINCODENAME -v $CHAINCODEVERSION -p "$NODE_SRC_PATH" -l "$LANGUAGE"

CHANNEL_NAME="channel-flight-chain"

echo "INSTANTIATE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME}"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" cli peer --logging-level debug chaincode instantiate -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -v $CHAINCODEVERSION -l "$LANGUAGE" -c '{"Args":[""]}' -P "OR ('SITAMSP.member','Org2MSP.member')"
sleep 10

echo "INVOKE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME} on peer0.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer0.sandbox.sita.aero:7051" cli peer chaincode invoke -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -c '{"function":"initLedger","Args":[""]}'

echo "INVOKE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME} on peer1.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer1.sandbox.sita.aero:7051" cli peer chaincode invoke -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -c '{"function":"initLedger","Args":[""]}'


CHANNEL_NAME="channel-flight-chain-mia"

echo "INSTANTIATE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME}"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" cli peer --logging-level debug chaincode instantiate -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -v $CHAINCODEVERSION -l "$LANGUAGE" -c '{"Args":[""]}' -P "OR ('SITAMSP.member','Org2MSP.member')"
sleep 10

echo "INVOKE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME} on peer0.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer0.sandbox.sita.aero:7051" cli peer chaincode invoke -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -c '{"function":"initLedger","Args":[""]}'

echo "INVOKE ${CHAINCODENAME} ${CHAINCODEVERSION}, channel ${CHANNEL_NAME} on peer1.sandbox.sita.aero:7051"
docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sandbox.sita.aero/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=peer1.sandbox.sita.aero:7051" cli peer chaincode invoke -o orderer.sita.aero:7050 -C $CHANNEL_NAME -n $CHAINCODENAME -c '{"function":"initLedger","Args":[""]}'




echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Your chaincode should now be deployed, and you should see another two docker images running with your basic local network"
echo ""
echo "some thing like"
echo ""
echo "CONTAINER ID        IMAGE                                                                                                         COMMAND                  CREATED              STATUS              PORTS                                            NAMES"
echo "ecd4ab3eda24        dev-peer0.sandbox.sita.aero-${CHAINCODENAME}-${CHAINCODEVERSION}-df6caaaa992cb4c675c9741661b86300c088dccc170f39da8b64773a8b7b94e4   \"/bin/sh -c 'cd /usr…\"   About a minute ago   Up About a minute                                                    dev-peer0.sandbox.sita.aero-${CHAINCODENAME}-${CHAINCODEVERSION}"
echo "da24ab3e4ecd        dev-peer1.sandbox.sita.aero-${CHAINCODENAME}-${CHAINCODEVERSION}-df6caaaa992cb4c675c9741661b86300c088dccc170f39da8b64773a8b7b94e4   \"/bin/sh -c 'cd /usr…\"   About a minute ago   Up About a minute                                                    dev-peer1.sandbox.sita.aero-${CHAINCODENAME}-${CHAINCODEVERSION}"
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""

docker ps


echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
echo "Done..."
echo ""
echo "You can now go to ../flight-chain-api and run 'npm run start:ba', and open browser on localhost:3000/api "
echo ""
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
echo ""
