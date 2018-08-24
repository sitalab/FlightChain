#!/usr/bin/env bash



# Adopted from fabric-samples/first-network/scripts/utils.sh


# verify the result of the end-to-end test
verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
    echo
    exit 1
  fi
}


createChannel() {

    CHANNEL=$1

	set -x
	# Create the channel
    docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" peer0.sandbox.sita.aero peer channel create -o orderer.sita.aero:7050 -c $CHANNEL -f /etc/hyperledger/configtx/$CHANNEL.tx >&log.txt
	res=$?
	set +x

	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel '$CHANNEL' created ===================== "
	echo
}


## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {

  CHANNEL=$1
  PEER=$2

  set -x
  docker exec -e "CORE_PEER_LOCALMSPID=SITAMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@sandbox.sita.aero/msp" -e "CORE_PEER_ADDRESS=$PEER" peer0.sandbox.sita.aero peer channel join -b $CHANNEL.block >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
    COUNTER=$(expr $COUNTER + 1)
    echo "peer${PEER} failed to join the channel $CHANNEL, Retry after $DELAY seconds"
    sleep $DELAY
    joinChannelWithRetry $CHANNEL $PEER
  else
    COUNTER=1
  fi
  verifyResult $res "After $MAX_RETRY attempts, peer${PEER} has failed to join channel '$CHANNEL' "
}