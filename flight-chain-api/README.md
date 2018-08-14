# flight-chain-api

## Description

REST API Interface to Flight Chain chaincode

The API interface exposes the chaincode. This is a CRU (as opposed to a CRUD) interface. There is no delete on a
blockchain so the operations are Create, Read, Update.
 

## Installation

Run this to install all the node_modules.

```bash
$ npm install
```

## Register admin/users

For local testing, it is necessary to bootstrap the network with an admin user
and some airline/airport users. The certificates & pem file are stored in `bootstrap/hfc-key-store` by default

> **NOTE** You must run this every time you rebuild your blockchain network.

First of all, purge all existing keys created from a previous run.

`rm -rf bootstrap/hfc-key-store`

`Then you have to enroll an admin user onto the system:

`node bootstrap/enrollAdmin.js`

Then you need to register users. 

`node bootstrap/registerUser.js <airline/airport code>`


e.g. this will register a British Airways user and a Miami Airport user

```
node bootstrap/registerUser.js BA
node bootstrap/registerUser.js MIA

```


## Running the app

When you start the app, you must specify via environment variables which port the instance of the REST API is listening 
on and what airline or airport identity is related to this instance.

There are some convenience scripts in package.json to set these environment variables.  

```bash

# launch in watch mode for British Airways
$ npm run start:ba
# launch in watch mode for Miami Airport
$ npm run start:mia

```

## User Interface

View the swagger docs for the API on `http://localhost:<LISTEN_PORT>/api.`


## API Security

TODO


## Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

