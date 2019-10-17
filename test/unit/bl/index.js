"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');

let group = {
	"_id": "5cfb05c22ac09278709d0141",
	"code": "BBBB",
	"name": "Unit test",
	"description": "Added by unit test importer.",
	"config": {
		"allowedPackages": {
			"DSBRD": ["DSBRD_DEVOP"]
		},
		"allowedEnvironments": {
			"DEV": {}
		}
	},
	"tenant": {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "TES0",
	}
};
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
				tenant: {
					id: "5c0e74ba9acc3c5a84a51251",
					code: "TES1",
					pin: {
						code: "5678",
						allowed: true
					}
				},
				groups: [
					"sub"
				]
			},
			{
				tenant: {
					id: "THYME_tID",
					code: "THYME_CODE",
					pin: {
						code: "5677",
						allowed: true
					}
				},
				groups: [
					"waiter"
				]
			},
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
		code: "TES0",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};
let token = {
	"_id": "5d35772718cb112936852a0c",
	"userId": "5d7fee0876186d9ab9b36492",
	"token": "f65e8358-ce1d-47cb-b478-82e10c93f70e",
	"expires": "2019-12-24T08:43:19.051Z",
	"status": "active",
	"ts": 1563784999051.0,
	"service": "addUser",
	"username": "tony"
};

let status;

describe("Unit test for: BL - index", () => {
	let soajs = {
		"tenant": {
			"code": "TES1",
			"id": "5c0e74ba9acc3c5a84a51251"
		},
		"servicesConfig": {
			"mail": {
				"from": "me@localhost.com",
				"transport": {
					"type": "sendmail",
					"options": {}
				}
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
			},
		}
	};
	
	before((done) => {
		let localConfig = helper.requireModule("config.js");
		BL.init(soajs, localConfig, () => {
			done();
		});
	});
	
	it('tests deleteGroup', (done) => {
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.cleanDeletedGroup = (data, cb) => {
			if (data && data.groupCode && data.groupCode === "error") {
				let error = new Error("User: Clean Deleted Group - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 2);
			}
		};
		
		BL.user.model = UserModel;
		
		function GroupModel() {
			console.log("group model");
		}
		
		GroupModel.prototype.closeConnection = () => {
		};
		
		GroupModel.prototype.delete = (data, cb) => {
			if (data && data.id && data.id === "error") {
				let error = new Error("Group:  Delete Group - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, group);
			}
		};
		
		BL.group.model = GroupModel;
		
		let data = {
			id: 'error'
		};
		
		BL.deleteGroup(soajs, data, null, (error) => {
			assert.ok(error);
			
			let data = {
				id: group._id
			};
			
			BL.deleteGroup(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				done();
			});
		});
	});
	it('tests validateJoin', (done) => {
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.getUser = (data, cb) => {
			if (data && data.id && data.id === '5d7fee0876186d9ab9b36493') {
				user.status = 'join';
				return cb(null, user);
			} else {
				return cb(null, user);
			}
		};
		
		UserModel.prototype.updateOneField = (data, cb) => {
			return cb(null, true);
		};
		
		BL.user.model = UserModel;
		
		function TokenModel() {
			console.log("token model");
		}
		
		TokenModel.prototype.closeConnection = () => {
		};
		
		TokenModel.prototype.get = (data, cb) => {
			if (data && data.token && data.token === 'error') {
				let error = new Error("Token:  Get Token - mongo error.");
				return cb(error, null);
			} else if (status === 'inactive') {
				token.userId = '5d7fee0876186d9ab9b36493';
				return cb(null, token);
			} else {
				return cb(null, token);
			}
		};
		
		TokenModel.prototype.updateStatus = (data, cb) => {
			return cb(null, true);
		};
		
		BL.token.model = TokenModel;
		
		let data = {
			token: "error"
		};
		
		BL.validateJoin(soajs, data, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 602,
				msg: 'Model error: Token:  Get Token - mongo error.'
			});
			
			let data = {
				token: "f65e8358-ce1d-47cb-b478-82e10c93f70e"
			};
			
			BL.validateJoin(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				status = 'inactive';
				
				let data = {
					token: "f65e8358-ce1d-47cb-b478-82e10c93f70e"
				};
				
				BL.validateJoin(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, true);
					done();
				});
			});
		});
	});
	it('tests validateChangeEmail', (done) => {
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.getUser = (data, cb) => {
			return cb(null, user);
		};
		
		UserModel.prototype.updateOneField = (data, cb) => {
			return cb(null, true);
		};
		
		BL.token.model = UserModel;
		
		function TokenModel() {
			console.log("token model");
		}
		
		TokenModel.prototype.closeConnection = () => {
		};
		
		TokenModel.prototype.get = (data, cb) => {
			if (data && data.token && data.token === 'error') {
				let error = new Error("Token:  Get Token - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, token);
			}
		};
		
		TokenModel.prototype.updateStatus = (data, cb) => {
			return cb(null, true);
		};
		
		BL.token.model = TokenModel;
		
		let data = {
			token: "error"
		};
		
		BL.validateChangeEmail(soajs, data, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 602,
				msg: 'Model error: Token:  Get Token - mongo error.'
			});
			
			let data = {
				token: "f65e8358-ce1d-47cb-b478-82e10c93f70e"
			};
			
			BL.validateChangeEmail(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				done();
			});
		});
	});
	it('tests resetPassword ', (done) => {
		function TokenModel() {
			console.log("token model");
		}
		
		TokenModel.prototype.closeConnection = () => {
		};
		
		TokenModel.prototype.get = (data, cb) => {
			if (data && data.token && data.token === 'error') {
				let error = new Error("Token:  Get Token - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, token);
			}
		};
		
		TokenModel.prototype.updateStatus = (data, cb) => {
			return cb(null, true);
		};
		
		TokenModel.prototype.updateStatus = (data, cb) => {
			return cb(null, true);
		};
		
		BL.token.model = TokenModel;
		
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.getUser = (data, cb) => {
			return cb(null, user);
		};
		
		UserModel.prototype.updateOneField = (data, cb) => {
			return cb(null, true);
		};
		
		BL.user.model = UserModel;
		
		let data = {
			token: 'error'
		};
		
		BL.resetPassword(soajs, data, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 602,
				msg: 'Model error: Token:  Get Token - mongo error.'
			});
			
			let data = {
				token: "f65e8358-ce1d-47cb-b478-82e10c93f70e",
				password: 'somenew',
				confirmation: 'somenew'
			};
			
			BL.resetPassword(soajs, data, null, (error, result) => {
				console.log(error, result, 'erora')
				assert.ok(result);
				assert.deepEqual(result, true);
				
				done();
			});
		});
	});
	
	it('tests changeEmail', (done) => {
		function TokenModel() {
			console.log("token model");
		}
		
		TokenModel.prototype.closeConnection = () => {
		};
		TokenModel.prototype.add = (data, cb) => {
			let token = {
				"token": "f65e8358-ce1d-32fb-b478-82e10c93e61f"
			};
			return cb(null, token);
		};
		
		BL.token.model = TokenModel;
		
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		
		UserModel.prototype.getUser = (data, cb) => {
			if (data && data.id && data.id === 'error') {
				let error = new Error('Model error: User: Check Username - mongo error.');
				return cb(error, null);
			} else {
				return cb(null, user);
			}
		};
		
		UserModel.prototype.checkUsername = (data, cb) => {
			if (data && data.username && data.username === 'found') {
				return cb(null, 1);
			} else if (data && data.username && data.username === 'error') {
				let error = new Error('Model error: User: Check Username - mongo error.');
				return cb(null, error);
			} else {
				return cb(null, null);
			}
		};
		
		BL.user.model = UserModel;
		
		let data = {
			id: 'error',
			email: 'error'
		};
		
		BL.changeEmail(soajs, data, null, (error) => {
			assert.ok(error);
			
			let data = {
				id: '5d7fee0876186d9ab9b36492',
				email: 'new@email.com'
			};
			
			BL.changeEmail(soajs, data, null, (error, result) => {
				console.log(result, 'resos');
				assert.ok(result);
				done();
			});
		});
	});
});