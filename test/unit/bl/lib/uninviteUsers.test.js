"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');

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
			
			let data = {
				users: [
					{
						user: {
							username: 'username'
						}
					}
				]
			};
			
			BL.uninviteUsers(soajs, data, null, (error, result) => {
				assert.ok(result);
				
				let data = {
					users: [
						{
							user: {
								email: 'email'
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
	});
});