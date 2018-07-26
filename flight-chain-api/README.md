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
and some airline/airport users.

First you have to enroll an admin user onto the system:

`node bootstrap/enrollAdmin.js`

Then you need to register users. 

`node bootstrap/registerUser.js <airline/airport code>`


e.g. this will register a British Airways user and a Miami Airport user

```
node bootstrap/registerUser.js BA
node bootstrap/registerUser.js MIA

```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## User Interface

View the swagger docs for the API on http://localhost:3000/api.


## API Security

TODO


## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

