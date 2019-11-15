"use strict";
const assert = require('assert');
let request = require("request");

let extKey = '3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9';
let accessToken = "44a5399dcce96325fadfab908e614bf00e6fe967";

function requester(apiName, method, params, cb) {
	let options = {
		uri: 'http://127.0.0.1:4000/urac' + apiName,
		headers: {
			key: extKey,
			access_token: accessToken
		},
		method: method.toUpperCase(),
		json: true
	};
	
	if (params.headers) {
		for (let header in params.headers) {
			if (Object.hasOwnProperty.call(params.headers, header)) {
				options.headers[header] = params.headers[header];
			}
		}
	}
	if(params.uri) {
		options.uri = params.uri + apiName;
	}
	if (params.form) {
		options.form = params.form;
	}
	if (params.body) {
		options.body = params.body;
	}
	if (params.qs) {
		options.qs = params.qs;
	}
	if (method === 'delete') {
		request.del(options, function (error, response, body) {
			return cb(error, body);
		});
	} else {
		request[method](options, function (error, response, body) {
			return cb(error, body);
		});
	}
}

module.exports = requester;