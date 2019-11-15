'use strict';

let tenant = {
	_id: "5da6d1ad93ef400c69f92a75",
	type: "client",
	code: "SUTE",
	name: "SUB test",
	description: "Testing Sub tenant",
	oauth: {
		secret: "this is a secret",
		redirectURI: "http://domain.com",
		grants: [
			"password",
			"refresh_token"
		],
		disabled: 0,
		type: 2,
		loginMode: "oauth"
	},
	applications: [
		{
			product: "DSBRD",
			package: "DSBRD_GUEST",
			appId: "5c0e74ba9acc3c5a84a5125a",
			description: "Dashboard application for DSBRD_GUEST package",
			_TTL: 604800000,
			keys: [
				{
					key: "562a938364953814c971d35a43c04a21",
					extKeys: [
						{
							extKey: "3d90163cf9d6b3076ad26aa5ed585563e3a2fbc6913140b8b3d225b64f448a6f4d9fd2efc726ab731ae8df37a1ed2bde9a48830f3d0c9dcff3047486401696ccd132a8077ae1759f0f78a1f74707951484a8eea174cdb865dc04120b218a7741",
							device: {
							
							},
							geo: {
							
							},
							env: "DASHBOARD",
							dashboardAccess: false,
							label: "extsub"
						}
					],
					config: {
						dashboard: {
							urac: {
								hashIterations: 24
							}
						}
					}
				}
			]
		}
	],
	profile: {
	
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN"
	}
};

module.exports = tenant;