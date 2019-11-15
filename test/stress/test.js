/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

const requester = require('./requester');
const assert = require('assert');

let extKey = '3d90163cf9d6b3076ad26aa5ed585563e3a2fbc6913140b8b3d225b64f448a6f4d9fd2efc726ab731ae8df37a1ed2bde9a48830f3d0c9dcff3047486401696ccd132a8077ae1759f0f78a1f74707951484a8eea174cdb865dc04120b218a7741'
let access_token = '7425a8ae4048d194f6390b64f45eb9525523a014';

describe("starting integration tests", () => {
	
	const interval = 100;
	let inviteusers = [];
	let uninviteusers = [];
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will add Users", (done) => {
		for (let i = 0; i < interval; i++) {
			let params = {
				body: {
					username: `username${i}`,
					firstName: `first${i}`,
					lastName: `last${i}`,
					profile: {},
					email: `email${i}@soajs.org`,
					groups: ['AAAA'],
					status: 'active',
					password: 'password'
				}
			};
			requester('/admin/user', 'post', params, (error, body) => {
				if (error) {
					console.log(error);
				}
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				assert.ok(body.data.hasOwnProperty('id'));
				let temp1 = {
					user: {
						id: body.data.id
					},
					pin: {
						code: true,
						allowed: true
					},
					groups: ['bbb']
				};
				
				let temp2 = {
					user: {
						id: body.data.id
					}
				};
				
				inviteusers.push(temp1);
				uninviteusers.push(temp2);
				if (i >= interval-1) {
					done();
				}
			});
		}
	});
	
	it("Success - will invite Users", (done) => {
		let params = {
			headers: {
				key: extKey,
				access_token: access_token
			},
			body: {
				users: inviteusers
			}
		};
		requester('/admin/users/invite', 'put', params, (error, body) => {
			if (error) {
				console.log(error);
			}
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.hasOwnProperty('succeeded'));
			assert.ok(body.data.hasOwnProperty('failed'));
			done();
		});
	});
	
	it.skip("Success - will uninvite Users", (done) => {
		let params = {
			headers: {
				key: extKey,
				access_token: access_token
			},
			body: {
				users: uninviteusers
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			if (error) {
				console.log(error);
			}
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.hasOwnProperty('succeeded'));
			assert.ok(body.data.hasOwnProperty('failed'));
			done();
		});
	});
});