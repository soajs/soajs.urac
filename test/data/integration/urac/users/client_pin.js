'use strict';

let user = {
	_id: "5db2d6962c9ae02845b300c5",
	username: "client",
	password: "$2a$12$KHUURFUk/rTXE44dDEM1bOMXSLwbtUTJPRzkVaPKy2/4rlJbIEZOW",
	firstName: "in",
	lastName: "client",
	email: "client@client.com",
	status: "active",
	config: {
		allowedTenants: [
			{
				tenant: {
					id: "5da6d6280067e20d5fe67667",
					code: "SOME",
					pin: {
						code: "5679",
						allowed: true
					}
				},
				groups: [
					"anyGroup"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN"
	},
	groups: [
	]
};

module.exports = user;