"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');

let user = {
	_id: "5d7fee0876186d9ab9b36492",
	locked: true,
	username: "tony",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "tony",
	lastName: "hage",
	email: "tony@localhost.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"owner"
	],
	config: {
		allowedTenants: []
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "test",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};
let user2 = {
	_id: "5d7fee0876186d9ab9b36493",
	locked: true,
	username: "fadi",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "fadi",
	lastName: "nasr",
	email: "fadi@localhost.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"owner"
	],
	config: {
		allowedTenants: [
			{
				tenant: {
					id: "ELVIRA_tID",
					code: "ELVIRA_CODE"
				},
				groups: [
					"manager"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "test",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};
let user3 = {
	_id: "5d7fee0876186d9ab9b36494",
	locked: true,
	username: "ragheb",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "ragheb",
	lastName: "ad",
	email: "ragheb@localhost.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"owner"
	],
	config: {
		allowedTenants: [
			{
				tenant: {
					id: "ELVIRA_tID",
					code: "ELVIRA_CODE"
				},
				groups: [
					"manager"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "test",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};

describe("Unit test for: BL - invite users", () => {
	let soajs = {
		"registry": {
			"custom": {
				"mail": {
					"value": {
						"from": "soajs@cloud.rockspoon.io",
						"transport": {
							"type": "smtp",
							"options": {
								"host": "smtp.mailgun.org",
								"port": 465,
								"auth": {
									"user": "soajs@cloud.rockspoon.io",
									"pass": "xxxxxxxxx"
								}
							}
						}
					}
				},
				"urac": {
					"value": {
						"hashIterations": 12,
						"link": {
							"addUser": "https://dev-site.rockspoon.io/#/setNewPassword",
							"changeEmail": "https://dev-site.rockspoon.io/#/changeEmail/validate",
							"forgotPassword": "https://dev-site.rockspoon.io/#/resetPassword",
							"join": "https://dev-site.rockspoon.io/#/join/validate"
						},
						"tokenExpiryTTL": 172800000,
						"validateJoin": true,
						"mail": {
							"addUser": {
								"subject": "Account Created at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
							},
							"changeEmail": {
								"subject": "Change Account Email at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
							},
							"changeUPin": {
								"subject": "Change Pin",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changePin.tmpl"
							},
							"changeUserStatus": {
								"subject": "Account Status changed at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
							},
							"forgotPassword": {
								"subject": "Reset Your Password at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
							},
							"invitePin": {
								"subject": "Pin Code Created at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/invitePin.tmpl"
							},
							"join": {
								"subject": "Welcome to SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
							}
						}
					}
				}
			}
		},
		"tenant": {
			"type": "client",
			"main": {
				"code": "test",
				"id": "5c0e74ba9acc3c5a84a51259"
			},
			"code": "subtest",
			"id": "5c0e74ba9acc3c5a84a5125a"
		},
		"servicesConfig": {
			"urac": {
				"validateJoin": true,
			}
		},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			},
			"info": (msg) => {
				console.log(msg);
			}
		}
	};

	before((done) => {
		let localConfig = helper.requireModule("config.js");
		BL.init(soajs, localConfig, () => {
			done();
		});
	});

	it("testing invite users", function (done) {
		function UserModel() {
			console.log("user model");
		}

		UserModel.prototype.closeConnection = () => {
		};

		UserModel.prototype.save = (data, cb) => {
			return cb(null, 1);
		};

		UserModel.prototype.getUser = (data, cb) => {
			if (data && data.id && data.id === "error") {
				let error = new Error("User: getUser - mongo error.");
				return cb(error, null);
			} else if (data && data.id && data.id === "5d7fee0876186d9ab9b36492") {
				return cb(null, user);
			} else if (data && data.id && data.id === "5d7fee0876186d9ab9b36493") {
				return cb(null, user2);
			} else {
				return cb(null, user3);
			}
		};

		UserModel.prototype.getUserByUsername = (data, cb) => {
			if (data && data.username && data.username === "error") {
				let error = new Error("User: getUserByUsername - mongo error.");
				return cb(error, null);
			} else if (data && data.username && (data.username === "tony" || data.email === "tony@localhost.com")) {
				return cb(null, user);
			} else if (data && data.username && (data.username === "fadi" || data.email === "fadi@localhost.com")) {
				return cb(null, user2);
			} else {
				return cb(null, user3);
			}
		};

		BL.user.model = UserModel;

		let data = {
			"username": "error"
		};
		BL.inviteUsers(soajs, data, null, (error) => {
			assert.ok(error);

			let data = {
				"id": "error"
			};

			BL.inviteUsers(soajs, data, null, (error) => {
				assert.ok(error);

				let data = {
					"_id": "error"
				};

				BL.inviteUsers(soajs, data, null, (error) => {
					assert.ok(error);

					let data = {
						users: [
							{
								user: {
									id: "5d7fee0876186d9ab9b36492"
								},
								pin: {
									allowed: true,
									code: true
								},
								groups: ['dev']
							}
						]
					};

					BL.inviteUsers(soajs, data, null, (error, result) => {
						assert.ok(result);
						assert.ok(result.failed.length === 0);
						assert.deepEqual(result, {
							succeeded: [{id: '5d7fee0876186d9ab9b36492'}],
							failed: []
						});

						let data = {
							users: [
								{
									user: {
										id: "5d7fee0876186d9ab9b36492"
									},
									pin: {
										allowed: true,
										code: true
									},
									groups: ['dev']
								}
							]
						};

						BL.inviteUsers(soajs, data, null, (error, result) => {
							assert.ok(result);
							assert.ok(result.failed);
							assert.deepEqual(result.failed, [ { id: '5d7fee0876186d9ab9b36492',
								reason: 'User has already been invited.' } ]);

							let data = {
								users: [
									{
										user: {
											username: "fadi"
										}
									}
								]
							};

							BL.inviteUsers(soajs, data, null, (error, result) => {
								assert.ok(result);
								assert.ok(result.failed.length === 0);
								assert.deepEqual(result, {
									succeeded: [{username: 'fadi'}],
									failed: []
								});

								let data = {
									users: [
										{
											user: {
												email: "ragheb@localhost.com"
											},
											pin: {
												allowed: true,
												code: true
											},
											groups: ['dev']
										}
									]
								};

								BL.inviteUsers(soajs, data, null, (error, result) => {
									assert.ok(result);
									assert.ok(result.failed.length === 0);
									assert.deepEqual(result, {
										succeeded: [{email: 'ragheb@localhost.com'}],
										failed: []
									});
									done();
								});
							});
						});
					});
				});
			});
		});
	});
});
