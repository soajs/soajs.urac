'use strict';

let product = {
	_id: "5c9e2466ab9d56e06a390b81",
	code: "TESTP",
	name: "test product",
	description: null,
	scope: {
		acl: {
			manual: {
				endpointservice: {
					"1": {
						access: false
					}
				}
			},
			kubelocal: {
				endpointservice: {
					"1.2": {
						access: false
					}
				}
			}
		}
	},
	packages: [
		{
			code: "TESTP_TESTP",
			name: "test package",
			description: null,
			acl: {
				manual: {
					werwerwe: [
						{
							version: "1"
						}
					]
				},
				kubelocal: {
					express: [
						{
							version: "1"
						}
					]
				}
			},
			_TTL: 604800000
		},
		{
			code: "TESTP_FABIO",
			name: "fabio package",
			description: "test name and stuff",
			acl: {
			
			},
			_TTL: 604800000
		}
	]
};
let consoleProduct = {
	_id: "5c7caabf6cbb9a5a5df92bae",
	locked: true,
	code: "DSBRD",
	name: "Console UI Product updated",
	description: "This is the main Console UI Product.",
	packages: [
		{
			code: "DSBRD_GUEST",
			name: "Guest",
			locked: true,
			description: "This package is used to provide anyone access to login and forgot password. Once logged in the package linked to the user tenant will take over thus providing the right access to the logged in user.",
			acl: {
				dashboard: {
					oauth: [
						{
							version: "1",
							get: [
								"Guest"
							],
							post: [
								"Guest"
							],
							delete: [
								"Tokenization"
							]
						}
					],
					urac: [
						{
							version: "2.1",
							get: [
								"Guest Account Settings",
								"Guest Email Account Settings",
								"My Account",
								"Administration"
							],
							post: [
								"Guest Account Settings",
								"My Account",
								"Administration"
							]
						}
					],
					dashboard: [
						{
							version: "1",
							post: [
								"Private Tenant ACL"
							]
						}
					]
				},
				kubelocal: {
					urac: [
						{
							version: "2"
						}
					]
				},
				antoine: {
					urac: [
						{
							version: "2"
						}
					]
				}
			},
			_TTL: 604800000
		},
		{
			code: "DSBRD_OWNER",
			name: "Owner",
			description: "This package is used to provide owner level access. This means the user who has this package will have access to everything.",
			locked: true,
			acl: {
				dashboard: {
					oauth: [
						{
							version: "1",
							get: [
								"Guest"
							],
							post: [
								"Guest"
							],
							delete: [
								"Tokenization",
								"User Tokenization",
								"Cient Tokenization"
							]
						}
					],
					urac: [
						{
							version: "2.1",
							get: [
								"Tenant",
								"Administration",
								"My Account",
								"Guest Email Account Settings",
								"Guest Account Settings"
							],
							post: [
								"Administration",
								"My Account",
								"Guest Account Settings"
							],
							delete: [
								"Administration"
							]
						}
					],
					dashboard: [
						{
							version: "1",
							get: [
								"Continuous Delivery",
								"Environment",
								"Templates",
								"Environment Databases",
								"Resources",
								"Custom Registry",
								"Environment Platforms",
								"Product",
								"Console Product",
								"Tenant",
								"Console Tenant",
								"Tenant oAuth",
								"Tenant Application",
								"Dashboard Tenants",
								"Tenant Settings",
								"Services",
								"Daemons",
								"Hosts",
								"HA Cloud",
								"Catalog",
								"Infra Providers",
								"API Builder",
								"Secrets",
								"Git Accounts",
								"Continuous Integration"
							],
							post: [
								"Continuous Delivery",
								"Environment",
								"Templates",
								"Environment Databases",
								"Resources",
								"Custom Registry",
								"Environment Platforms",
								"Product",
								"Tenant",
								"Tenant oAuth",
								"Tenant Application",
								"Tenant Settings",
								"Services",
								"Daemons",
								"Hosts",
								"HA Cloud",
								"Catalog",
								"swagger",
								"Simulate",
								"Continuous Delivery Deployment",
								"Private Tenant ACL",
								"Infra Providers",
								"API Builder",
								"Secrets",
								"Git Accounts",
								"Continuous Integration"
							],
							put: [
								"Continuous Delivery",
								"Environment",
								"Environment Databases",
								"Resources",
								"Custom Registry",
								"Environment Platforms",
								"Product",
								"Tenant",
								"Tenant oAuth",
								"Tenant Application",
								"Tenant Settings",
								"Services",
								"Daemons",
								"HA Cloud",
								"Catalog",
								"Owner HA Cloud",
								"Infra Providers",
								"API Builder",
								"Git Accounts",
								"Continuous Integration"
							],
							delete: [
								"Environment",
								"Templates",
								"Environment Databases",
								"Resources",
								"Custom Registry",
								"Environment Platforms",
								"Product",
								"Tenant",
								"Tenant oAuth",
								"Tenant Application",
								"Tenant Settings",
								"Daemons",
								"HA Cloud",
								"Catalog",
								"Infra Providers",
								"API Builder",
								"Secrets",
								"Git Accounts",
								"Continuous Integration"
							]
						}
					]
				}
			},
			_TTL: 604800000
		}
	],
	scope: {
		acl: {
			dashboard: {
				urac: {
					"2.1": {
						access: true,
						get: [
							{
								group: "Guest Email Account Settings",
								apis: {
									"/changeEmail/validate": {
										access: true
									}
								}
							}
						],
						post: [
							{
								group: "Guest Account Settings",
								apis: {
									"/resetPassword": {
										access: true
									}
								}
							}
						],
						delete: [
							{
								group: "Administration",
								apis: {
									"/admin/group/delete": {
										access: true
									}
								}
							}
						]
					}
				},
				dashboard: {
					"1": {
						access: false,
						post: [
							{
								group: "Continuous Delivery Deployment",
								apis: {
									"/cd/deploy": {
										access: false
									}
								}
							}
						]
					}
				},
				oauth: {
					"1": {
						access: false,
						delete: [
							{
								group: "Tokenization",
								apis: {
									"/refreshToken/:token": {
										access: true
									}
								}
							},
							{
								group: "General",
								apis: {
									"/accessToken/:token": {
										access: false
									},
									"/refreshToken/:token": {
										access: false
									},
									"/tokens/user/:userId": {
										access: false
									},
									"/tokens/tenant/:clientId": {
										access: false
									}
								}
							}
						]
					}
				}
			},
			manual: {
				urac: {
					"2.1": {
						access: false
					}
				}
			},
		}
	}
};

module.exports = function () {
	let data = {
		"product": product,
		"consoleProduct": consoleProduct,
	};
	return data;
};