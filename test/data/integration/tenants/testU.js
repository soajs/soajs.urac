'use strict';

let lib = {
	_id: "5da6e4b3f7d97b11363e08fc",
	type: "product",
	code: "TESU",
	name: "test sub",
	description: null,
	oauth: {
		secret: "this is a secret",
		redirectURI: "http://domain.com",
		grants: [
			"password",
			"refresh_token"
		],
		disabled: 1,
		type: 2,
		loginMode: "oauth"
	},
	applications: [
		{
			product: "TPROD",
			package: "TPROD_BASIC",
			appId: "5da6e4b3f7d97b11363e08fd",
			description: "Dashboard application for TPROD_BASIC package",
			_TTL: 604800000,
			keys: [
				{
					key: "20c4a5fecdd42ab7af9c0e9ce9842fed",
					extKeys: [
						{
							extKey: "9d8fd45702c8fe79f7a27ac21084f6b76eba5484e42ca23266411e3100d27fee0262a2e8e632f5895e273ca0eca74e90f1293abdd5936e578237567237fbd209067c4a906377ea20da42b279db5a4f9642b599b5e06b9ae38d86211339b9bd4e",
							device: {
							
							},
							geo: {
							
							},
							env: "DEV",
							dashboardAccess: false,
							label: "extsub",
							expDate: 1571432400000.0
						}
					],
					config: {
					
					}
				}
			]
		}
	],
	profile: {
	
	}
};

module.exports = lib;