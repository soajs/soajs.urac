"use strict";

describe("starting index integration tests", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("loading index integration tests", (done) => {
		// GET
		require('./get/getAll.test');
		require('./get/validateJoin.test');
		require('./get/validateChangeMail.test');
		require('./get/forgotPassword.test');
		
		//POST
		require('./post/join.test');
		
		//PUT
		require('./put/editUser.test');
		require('./put/resetPassword.test');
		require('./put/accountEmail.test');
		require('./put/userPin.test');
		require('./put/uninviteUsers.test');
		require('./put/inviteUsers.test');
		
		//DELETE
		require('./delete/deleteGroup.test');
		
		done();
	});
	
});