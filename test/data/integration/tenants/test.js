'use strict';

let lib = {
    "_id": "5d9321f8b40e09438afbd0c9",
    "type": "product",
    "oauth": {
        secret: "this is a secret",
        redirectURI: "http://domain.com",
        grants: [
            "password",
            "refresh_token"
        ],
        disabled: 0,
        type: 2.0,
        loginMode: "urac",
        pin: {
            DSBRD: {
                enabled: false
            }
        },
    },
    "code": "test",
    "name": "Test Tenant",
    "description": "this is a description for test tenant",
    "applications": [
        {
            "product": "TPROD",
            "package": "TPROD_BASIC",
            "appId": "30d2cb5fc04ce51e06000001",
            "description": "this is a description for app for test tenant for test product and basic package",
            "_TTL": 7 * 24 * 3600 * 1000, // 7 days hours
            "keys": [
                {
                    "key": "d1eaaf5fdc35c11119330a8a0273fee9",
                    "extKeys": [
                        {
                            "expDate": new Date().getTime() + 7 * 24 * 3600 * 1000, // + 7 days
                            "extKey": "aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac",
                            "dashboardAccess": true,
                            "device": {},
                            "geo": {}
                        }
                    ],
                    "config": {
                        "dev": {
                            "oauth": {
                                "loginMode": 'urac'
                            },
                            "mail": {
                                "from": 'me@localhost.com',
                                "transport": {
                                    "type": "sendmail",
                                    "options": {}
                                }
                            },
                            "urac": {
                                "hashIterations": 1024, //used by hasher
                                "seedLength": 32, //used by hasher
                                "link": {
                                    "addUser": "http://dashboard.soajs.org/#/setNewPassword",
                                    "changeEmail": "http://dashboard.soajs.org/#/changeEmail/validate",
                                    "forgotPassword": "http://dashboard.soajs.org/#/resetPassword",
                                    "join": "http://dashboard.soajs.org/#/join/validate"
                                },
                                "tokenExpiryTTL": 2 * 24 * 3600 * 1000,// token expiry limit in seconds
                                "validateJoin": true, //true if registration needs validation
                                "mail": { //urac mail options
                                    "join": {
                                        "subject": 'Welcome to SOAJS'
                                    },
                                    "forgotPassword": {
	                                    "subject": "Reset Your Password at SOAJS",
	                                    "path": "/mail/urac/forgotPassword.tmpl",
                                    },
                                    "addUser": {
                                        "subject": 'Account Created at SOAJS'
                                    },
                                    "changeUserStatus": {
                                        "subject": "Account Status changed at SOAJS",
                                        //use custom HTML
                                        "content": "<p>Dear <b>{{ username }}</b>, <br />The administrator update your account status to <b>{{ status }}</b> on {{ts}}.<br /><br />Regards,<br/>SOAJS Team.</p>"
                                    },
                                    "changeEmail": {
                                        "subject": "Change Account Email at SOAJS"
                                    }
                                }
                            },
                            "commonFields": {
                            }
                        }
                    }
                }
            ]
        },
        {
            "product": "TPROD",
            "package": "TPROD_EXA3",
            "appId": "30d2cb5fc04ce51e06000002",
            "description": "this is a description for app for test tenant for test product and basic package, and with example03 in acl",
            "_TTL": 86400000, // 24 hours
            "keys": [
                {
                    "key": "695d3456de70fddc9e1e60a6d85b97d3",
                    "extKeys": [
                        {
                            "expDate": new Date().getTime() + 86400000,
                            "extKey": "aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c",
                            "device": {},
	                        "env": "DASHBOARD",
                            "geo": {}
                        }
                    ],
	                "config": {
		                "dashboard": {
			                "oauth": {
				                "loginMode": 'urac'
			                },
			                "urac": {
				                "hashIterations": 1024, //used by hasher
				                "seedLength": 32, //used by hasher
				                "link": {
					                "addUser": "http://dashboard.soajs.org/#/setNewPassword",
					                "changeEmail": "http://dashboard.soajs.org/#/changeEmail/validate",
					                "forgotPassword": "http://dashboard.soajs.org/#/resetPassword",
					                "join": "http://dashboard.soajs.org/#/join/validate",
				                },
				                "tokenExpiryTTL": 2 * 24 * 3600 * 1000,// token expiry limit in seconds
				                "validateJoin": true, //true if registration needs validation
				                "mail": { //urac mail options
					                "join": {
						                "subject": 'Welcome to SOAJS',
						                "path": "/mail/urac/join.tmpl"
					                },
					                "forgotPassword": {
						                "subject": "Reset Your Password",
						                "path": "/mail/urac/forgotPassword.tmpl"
					                },
					                "addUser": {
						                "subject": 'Account Created',
						                "path": "/mail/urac/addUser.tmpl"
					                },
					                "changeUserStatus": {
						                "subject": "Account Status changed",
						                //use custom HTML
						                "content": "<p>Dear <b>{{ username }}</b>, <br />The administrator update your account status to <b>{{ status }}</b> on {{ts}}.<br /><br />Regards,<br/>SOAJS Team.</p>"
					                },
					                "changeEmail": {
						                "subject": "Change Account Email",
						                "path": "/mail/urac/changeEmail.tmpl"
					                },
					                "invitePin": {
						                "subject": "Invite User Pin",
						                "path": "/mail/urac/invitePin.tmpl"
					                },
					                "changePin": {
						                "subject": "Change User Pin",
						                "path": "/mail/urac/changePin.tmpl"
					                },
					                "resetPin": {
						                "subject": "Reset User Pin",
						                "path": "/mail/urac/resetPin.tmpl"
					                }
				                }
			                },
			                "commonFields": {
				                "mail": {
					                "from": "fadi@soajs.org",
					                "transport": {
						                "type": "smtp",
						                "options": {
							                "host": "secure.emailsrvr.com",
							                "port": 465,
							                "auth": {
								                "user": "fadi@soajs.org",
								                "pass": "Default_2019"
							                }
						                }
					                }
				                },
			                }
		                }
	                }
                }
            ]
        }
    ],
    "console": false
};

module.exports = lib;
