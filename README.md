# soajs.urac
[![Build Status](https://travis-ci.org/soajs/soajs.urac.svg?branch=master)](https://travis-ci.org/soajs/soajs.urac)
[![Coverage Status](https://coveralls.io/repos/soajs/soajs.urac/badge.png)](https://coveralls.io/r/soajs/soajs.urac)
[![Known Vulnerabilities](https://snyk.io/test/github/soajs/soajs.urac/badge.svg)](https://snyk.io/test/github/soajs/soajs.urac)

SOAJS URAC is a service that manages all users accounts for all tenants.

This service is also equipped with an optional mail notification system that is configurable.

The URAC offers the ability to override the service access level as well as configuration for specific users.

The service is Multitenant and provides the:

* ability for administrators to control user accounts, groups and access levels.
* ability to update profile and preferences for logged in members.
* ability to register and login for anonymous users.


### Environment variables

ENV Variable | Description | Default | Example
--- | ----- | :---: | ---
SOAJS_SERVICE_MODEL | The model | mongo | other models can be implemented aka oracle, postgresql


### Complete Documentation
More information is available on SOAJS website under the section for [URAC](https://soajsorg.atlassian.net/wiki/spaces/URAC).


### License
*Copyright SOAJS All Rights Reserved.*

Use of this source code is governed by an Apache license that can be found in the LICENSE file at the root of this repository.
