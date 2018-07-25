# Basic Network Config

This config is adoped from https://github.com/hyperledger/fabric-samples/tree/release-1.2/first-network

## Generate

Note that this basic configuration uses pre-generated certificates and
key material, and also has predefined transactions to initialize a 
channel named "mychannel".

To regenerate this material, simply run ``generate.sh``.

## Starting the network

Run ``start.sh`` to bring up the network.  

Check that all the images are running by running `docker ps`. You should see these 4 images. 

```
KOS:sita-basic-network kosullivan$ docker ps
CONTAINER ID        IMAGE                        COMMAND                  CREATED             STATUS              PORTS                                            NAMES
1a2ab5774c07        hyperledger/fabric-peer      "peer node start"        11 seconds ago      Up 13 seconds       0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
57d6a896fbe5        hyperledger/fabric-couchdb   "tini -- /docker-ent…"   14 seconds ago      Up 14 seconds       4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
823366705d09        hyperledger/fabric-ca        "sh -c 'fabric-ca-se…"   14 seconds ago      Up 15 seconds       0.0.0.0:7054->7054/tcp                           ca.example.com
2fafca22605d        hyperledger/fabric-orderer   "orderer"                14 seconds ago      Up 15 seconds       0.0.0.0:7050->7050/tcp                           orderer.example.com

```

## Stopping & Cleaning up...

To stop it, run ``stop.sh``
To completely remove all incriminating evidence of the network
on your system, run ``teardown.sh``.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
