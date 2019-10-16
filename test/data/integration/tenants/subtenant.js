'use strict';

let lib = {
	_id: "5da6d6280067e20d5fe67667",
	type: "client",
	code: "SOME",
	name: "some",
	description: "new",
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
			product: "TPROD",
			package: "TPROD_BASIC",
			appId: "5da6e4fcf7d97b11363e08ff",
			description: null,
			_TTL: 21600000,
			keys: [
				{
					key: "be9f309c1e9f72456f68dfef48ede9d2",
					extKeys: [
						{
							extKey: "e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18",
							device: {
							
							},
							geo: {
							
							},
							env: "DASHBOARD",
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
	
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "DBTN"
	}
};

module.exports = lib;
