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
		allowedTenants: [
			{
				"code": "TES0",
				"id": "5c0e74ba9acc3c5a84a51259"
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
		"tenant": {
			"type": "client",
			"main": {
				"code": "test",
				"id": "5c0e74ba9acc3c5a84a51259"
			},
			"code": "TES1",
			"id": "5c0e74ba9acc3c5a84a5125a"
		},
		"servicesConfig": {},
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
	
	it("testing uninvite users", (done) => {
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.uninvite = (data, cb) => {
			if (data && data.users && data.users[0].user.id === 'error') {
				let error = new Error("User: uninvite - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		
		BL.user.model = UserModel;
		
		let data = {
			users: [
				{
					user: {
						id: '5d7fee0876186d9ab9b36492'
					}
				}
			]
		};
		
		BL.uninviteUsers(soajs, data, null, (error, result) => {
			assert.ok(result);
			done();
		});
	});
});