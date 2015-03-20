'use strict';

//password = mathieu
var antoine = {
	"_id": ObjectId("22d2cb5fc04ce51e06000001"),
	"username": "ahage",
	"password": '$2a$04$EfG6mMcD/o5UCU9qnkSIAOMx20msSKgNhCWrqfAd7SHtan5ae2NWO',
	"firstName": "Antoine",
	"lastName": "Hage",
	"email": "me@antoinehage.com",
	"ts": new Date().getTime(),
	"status": "active",
	"profile": {},
	"groups": [],
	"config": {
		"packages": {
			"TPROD_BASIC": { //URACPACKAGE
				"acl": { //URACPACKAGEACL
					"urac": {},
					"example03": {}
				}
			}
		},
		"keys": {
			"d1eaaf5fdc35c11119330a8a0273fee9": { //URACKEY
				"config": { //URACKEYCONFIG
					"urac": {}
				},
				"acl": { //URACKEYACL
					"urac": {},
					"example03": {}
				}
			}
		},
		"dashboard": [
			"members",
			"environments",
			"productization",
			"productization_packages",
			"multi-tenancy",
			"multi-tenancy_applications",
			"multi-tenancy_keys"
		]
	}
};