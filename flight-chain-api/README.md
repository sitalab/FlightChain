# flight-chain-api

## Description

REST API Interface to Flight Chain chaincode

The API interface exposes the chaincode. This is a CRU (as opposed to a CRUD) interface. There is no delete on a
blockchain so the operations are Create, Read, Update.
 

## Installation

```bash
$ npm install
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

