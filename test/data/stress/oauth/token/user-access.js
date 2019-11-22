'use strict';

let token = {
	_id: "5db2c71c9cb7b723fc462fbc",
	type: "accessToken",
	token: "7425a8ae4048d194f6390b64f45eb9525523a014",
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