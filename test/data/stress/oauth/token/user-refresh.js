'use strict';

let token = {
	_id: "5dceb58ae874480a8fd4cde4",
	type: "refreshToken",
	token: "c14b9f786594bfa39f175d1339401079b06f0b97",
	clientId: "5c0e74ba9acc3c5a84a51259",
	user: {
		_id: "5dcec7e09cf9630d4be97543",
		username: "inviteTest",
		firstName: "test",
		lastName: "invite",
		email: "invite@subtenant.com",
		ts: 1552747600152.0,
		status: "active",
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
		lastLogin: 1571310397641.0,
		loginMode: "urac",
		id: "5dcec7e09cf9630d4be97543"
	},
	env: "dashboard",
	expires: new Date((new Date().getFullYear()) + 2, 0, 1)
};

module.exports = token;