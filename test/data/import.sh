#!/bin/bash

pushd ./urac
mongo ./TES0_groups.js
mongo ./TES0_users.js
popd