//password = 123456
var user2 = {
	"_id": ObjectId("54ee46e7a8643c4d10a61ba3"),
	"username": "user2",
	"password": '$2a$04$yn9yaxQysIeH2VCixdovJ.TLuOEjFjS5D2Otd7sO7uMkzi9bXX1tq',
	"firstName": "user",
	"lastName": "two",
	"email": "user2@domain.com",
	"ts": new Date().getTime(),
	"status": "active",
	"profile": {},
	"groups": ['silver'],
	"config": {
		"packages": {
			"PROD1_PCK1": {
				"acl": {
					"urac": {},
					"example04": {},
					"example03": {
						"apisPermission": "restricted",					
						"apis": {						
							"/buildName": {								
							}
						}																
					}
				}
			}
		},
		"keys": {
			"41eb3256ce660a891205d0a0eca19421":{
				"config": { //KEY CONFIG application 2
					"example03": {
						"tenantName": "Tenant name specific to user two"
					},
					"example04": {
						"tenantName": "Tenant name specific to user two"
					}
				}
			},
			"19c03e42c750467c3f8481fbe26f2fef": { 						
			}
		}
	}
};


