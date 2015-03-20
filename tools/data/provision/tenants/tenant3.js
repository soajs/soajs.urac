'use strict';

var tenant3 = {
	"_id": ObjectId('54ee2925203674ba271d57a5'),
	"code": "TNT3",
	"name": "Client 3",
	"description": "Test Client 3",
	"oauth": {},
	"applications": [
		{
			"product": "PROD1",
			"package": "PROD1_PCK3",
			"appId": ObjectId('54ee3016203674ba271d57a8'),
			"description": "Tenant 3 takes package 3",
			"_TTL": 7 * 24 * 3600 * 1000, // 7 days hours,
			"keys": [
				{
					"key": "bd27f3b87cd7c94c2c41a324881fa7cc",
					"extKeys": [
						{
							"expDate": new Date().getTime() + 86400000,
							"extKey": "7bc1e66d003a3b2acfce1557cbda7320ec45057be0505fd7e9dec19e9fe74c194b109a48568f53449c1cc607a3cb23d70de86831a2ac4b87f1c0c5d57d19702a74ac22a64531185af11f75967f9ba54cb930149ed8a1384f924be9baa4ed5b0b",
							"device": null,
							"geo": null
						}
					],
					"config": {
						"dev":{
							"urac": {
								"hashIterations": 1024, //used by hasher
								"seedLength": 32, //used by hasher
								"link": {},
								"tokenExpiryTTL": 2 * 24 * 3600 * 1000
							},
							"example03": { "tenantName":"Client Three"}
						}						
					}
				},
				{
					"key": "cb00d35babeee8cc113dc64d749bcdc9",
					"extKeys": [
						{
							"expDate": new Date().getTime() + 86400000,
							"extKey": "7bc1e66d003a3b2acfce1557cbda732057c85fdf66f34045f51a6c65c62660ba42aba1e13a19a96bc3dd4c290c5490f8003959b38eac7fec2ddb79cf0eddd63dc640cc5dafb93ff19a573df1ff089b96fbddaae6f1d569b92afbd5ee3be47af0",
							"device": null,
							"geo": null
						}
					],
					"config": {
						"dev":{
							"urac": {
								"hashIterations": 1024, //used by hasher
								"seedLength": 32, //used by hasher
								"link": {},
								"tokenExpiryTTL": 2 * 24 * 3600 * 1000
							},
							"example03": { "tenantName":"Client 3"}
						}
						
					}
				}
			]
		}
	]
};