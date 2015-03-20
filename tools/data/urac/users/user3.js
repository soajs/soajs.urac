'use strict';

//password = 654321
var user3 = {
	"_id": ObjectId("54ee1bf91856706c2363930a"),
	"username": "user3",
	"password": '$2a$04$IYQThNn52hRm/DfZdanbkO/iTL5ytuoGBy6hQJX03ZcqDSA0KFFNq',
	"firstName": "user",
	"lastName": "three",
	"email": "user3@domain.com",
	"ts": new Date().getTime(),
	"status": "active",
	"profile": {},
	"groups": ['gold', 'silver', 'customer'],
	"config": {
		"packages": {
			"PROD1_PCK1": {  
				"acl": { 
					"urac": {},
					"example03": {},
					"example04": {}
				}
			}
		},
		"keys": {
			"19c03e42c750467c3f8481fbe26f2fef": { // app 1
				"config": { 				
					"example03": {
						"tenantName": "Tenant name specific to user three"
					},
					"example04": {
						"tenantName": "Tenant name specific to user three"
					}
				},
				"acl": { 
					"urac": {},
					"example04": {},
					"example03": {
						"apisPermission": "restricted",					
						"apis": {						
							"/buildName": {}
						}
					}
				}
			}
		}
	}
};