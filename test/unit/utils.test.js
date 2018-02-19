"use strict";
var assert = require("assert");
var helper = require('../helper');

var utils = helper.requireModule('./lib/utils');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;

describe("testing utils", function () {
	let request = {
		headers: {
			key: "",
			soajsauth: ""
		},
		query: {
			access_token: ""
		},
		soajs: {
			awareness: {
				getHost: function (name, cb) {
					return cb('host');
				}
			},
			config: {
				errors: {
					"438": "error"
				}
			},
			registry: {
				services: {
					controller: {
						port: 4000
					}
				},
				coreDB: {
					provision: {
						"name": "core_provision",
						"prefix": '',
						"servers": [
							{
								"host": "127.0.0.1",
								"port": 27017
							}
						],
						"credentials": null,
						"URLParam": {
							"poolSize": 5,
							"autoReconnect": true
						}
					}
				}
			},
			inputmaskData: {
				soajs_project: "",
				tenantId: "57a2495612979c1655f0ed70"
			},
			log: {
				error: function (err) {
					console.log(err);
				}
			}
		}
	};
	
	afterEach(function (done) {
		done();
	});

	it("Test getTenantExtKey", function (done) {

		utils.getTenantExtKey(request, function (error, body) {
			done();
		});
	});

	it("Test extractServiceConfig", function (done) {
		let info = {
			switchTenant: {
				applications: [
					{
						keys: [
							{
								extKeys: [
									{
										extKey: "123"
									}
								],
								config: {
									dev: {
										commonFields: {}
									}
								}
							}
						]
					}
				]
			},
			getTenantExtKey: {
				extKey: "123"
			}
		};
		let tenantServiceConfig = {
			urac: {}
		};
		utils.extractServiceConfig(info, tenantServiceConfig, function (error, body) {
			done();
		});
	});

});