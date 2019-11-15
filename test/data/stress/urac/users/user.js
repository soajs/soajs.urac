'use strict';

let user = {
	_id: "5dcec7e09cf9630d4be97543",
	locked: true,
	username: "inviteTest",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "test",
	lastName: "invite",
	email: "invite@subtenant.com",
	ts: 1552747600152.0,
	status: "active",
	profile: {
	
	},
	groups: [
		"owner"
	],
	config: {
		allowedTenants: [
			{
				tenant: {
					id: "5da6d1ad93ef400c69f92a75",
					code: "SUTE"
				},
				groups: [
					"develop"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN"
	},
};

module.exports = user;