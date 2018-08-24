#!/usr/bin/env bash

echo "Creating the admin user, and the users for BA, LHR, MIA, GVA"

rm -rf bootstrap/hfc-key-store
node bootstrap/enrollAdmin.js
node bootstrap/registerUser.js BA
node bootstrap/registerUser.js LHR
node bootstrap/registerUser.js MIA
node bootstrap/registerUser.js GVA
