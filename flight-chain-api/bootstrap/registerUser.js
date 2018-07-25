'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Register and Enroll a user
 */

var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log(' Store path:'+store_path);


const args = process.argv;
if (args.length !== 3) {
    console.error('');
    console.error('You must specify the identity of the airline/airport being added')
    console.error('e.g. node bootstrap/registerUser.js BA');
    console.error('e.g. node bootstrap/registerUser.js LHR');
    console.error('');
    process.exit(1);
}
var username = args[2];

if (username.length<2 || username.length>3) {
    console.error('');
    console.error(`'${username} is not a valid airline or airport code.`);
    console.error('The identity value must be 2 letter IATA code (for an airline) or 3 letter IATA code (for an airport)');
    console.error('e.g. node bootstrap/registerUser.js BA');
    console.error('e.g. node bootstrap/registerUser.js LHR');
    console.error('');
    process.exit(1);
} else {
    username = username.toUpperCase();
}

console.error('');
console.error('');
console.log('Adding identity for '+username);
console.log('An attribute for iata-code will also be added to the certificate which can be used in the chain code to validate the transaction executor');
console.error('');
console.error('');


// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
    // assign the store to the fabric client
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    var	tlsOptions = {
        trustedRoots: [],
        verify: false
    };
    // be sure to change the http to https when the CA is running TLS enabled
    fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', null , '', crypto_suite);

    // first check to see if the admin is already enrolled
    return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded admin from persistence');
        admin_user = user_from_store;
    } else {
        throw new Error('Failed to get admin.... run enrollAdmin.js');
    }

    // at this point we should have the admin user
    // first need to register the user with the CA server
    let attrs = [];
    attrs.push({name: 'iata-code', value: username, ecert: true});
    return fabric_ca_client.register({attrs: attrs, enrollmentID: username, affiliation: 'org1.department1',role: 'FlightChainUser'}, admin_user);
}).then((secret) => {
    // next we need to enroll the user with CA server
    console.log('Successfully registered '+username+' - secret:'+ secret);

    return fabric_ca_client.enroll({enrollmentID: username, enrollmentSecret: secret});
}).then((enrollment) => {
    // console.log('Successfully enrolled member user "'+username+'" ', enrollment);
    return fabric_client.createUser(
        {username: username,
            mspid: 'Org1MSP',
            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
        });
}).then((user) => {

    // console.log('user created ', user);
    member_user = user;
    return fabric_client.setUserContext(member_user);
}).then(()=>{
    console.log(username+ ' was successfully registered and enrolled and is ready to interact with the fabric network');

}).catch((err) => {
    console.error('Failed to register: ' + err);
    if(err.toString().indexOf('Authorization') > -1) {
        console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
            'Try again after deleting the contents of the store directory '+store_path);
    }
});
