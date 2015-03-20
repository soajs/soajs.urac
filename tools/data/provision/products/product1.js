var product1 = {
	"_id": ObjectId('54ee234db7a669fc22b7f6ba'),
	"code": "PROD1",
	"name": "Product one",
	"description": "this is a test Product for examples",
	"packages": [
		{
			"code": "PROD1_PCK1",
			"name": "Package 1",
			"description": "This is a test package. it offers the urac",
			"acl": {
				"urac": {},
				"oauth": {},
				"example04": {}
			},
			"_TTL": 86400000
		},
		{
			"code": "PROD1_PCK2",
			"name": "Package 2",
			"description": "Test package, it offers urac and example03",
			"acl": {
				"urac": {},
				"example03": {}
			},
			"_TTL": 86400000
		},
		{
			"code": "PROD1_PCK3",
			"name": "Package 3",
			"description": "This test package offers urac, and only the buildName api from example03",
			"acl": {
				"urac": {},
				"example03": {
					"apisPermission": "restricted",					
					"apis": {						
						"/buildName": {
						}
					}
				}
			},
			"_TTL": 86400000
		},
		{
			"code": "PROD1_PCK4",
			"name": "Package 4",
			"description": "",
			"acl": {
				"urac": {
					"access": false,
					"apisRegExp": [	               
		               {		            	  
		            	   "regExp": /^\/admin\/.+$/,
		                   "access": ["gold"] 
		               },
		               {
		            	   'regExp': /^\/account\/.+$/,
		                   'access': true
		               }
		           ]
				},
				"example04": {
					"access": false,
					"apis":{
						"/buildName":{
							"access": true
						},
						"/buildNameGold":{
							"access": ['gold']
						}
					}
				},
				"oauth": {},
				"example03": {
					"access": false
				}
			},
			"_TTL": 86400000
		}
	]
};
