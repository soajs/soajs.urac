'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const commonResponse = require("./comonResponse.js");
const request = require("request");
const service_name = "oauth";
const service_version = "1";

let sdk = {
	"auto_login": (soajs, data, cb) => {
		soajs.awareness.connect(service_name, service_version, (response) => {
			if (response && response.host) {
				let options = {
					uri: 'http://' + response.host + "/token/auto/" + data.id,
					headers: response.headers,
					json: true
				};

				request.post(options, function (error, response, body) {
					return commonResponse(soajs, body, error, cb);
				});
			} else {
				return cb(null, null);
			}
		});
	}
};

module.exports = sdk;
