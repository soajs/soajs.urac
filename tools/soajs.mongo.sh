#!/bin/bash

pushd ./data/provision
mongo ./oauth_urac.js
mongo ./provision.js
mongo ./product.js
popd
pushd ./data/urac
mongo ./urac.js
popd