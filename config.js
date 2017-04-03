'use strict';
var accessSchema = {
	"oneOf": [
		{"type": "boolean", "required": false},
		{"type": "array", "minItems": 1, "items": {"type": "string", "required": true}, "required": false}
	]
};
var acl = {
	"type": "object",
	"required": false,
	"properties": {
		"access": accessSchema,
		"apisPermission": {"type": "string", "enum": ["restricted"], "required": false},
		"apis": {
			"type": "object",
			"required": false,
			"patternProperties": {
				"^[_a-z\/][_a-zA-Z0-9\/:]*$": { //pattern to match an api route
					"type": "object",
					"required": true,
					"properties": {
						"access": accessSchema
					},
					"additionalProperties": false
				}
			}
		},
		"apisRegExp": {
			"type": "array",
			"required": false,
			"minItems": 1,
			"items": {
				"type": "object",
				"properties": {
					"regExp": {"type": "pattern", required: true, "pattern": /\.+/},
					"access": accessSchema
				},
				"additionalProperties": false
			}
		}
	}
};

module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 2,
	"serviceName": "urac",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4001,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"hashIterations": 1024,
	"seedLength": 32,
	"extKeyRequired": true,
	"oauth": true,
	"session": true,
	"model": 'mongo',
	
	"cmd": ["/etc/init.d/postfix start"],
	
	"maxStringLimit": 30,
	"errors": {
		399: "Missing Service config. Contact system Admin",
		400: "Database connection error",
		401: "Unable to log in the user. User not found.",
		402: "User account already exists.",
		403: "User Not Found!",
		404: "Unable to logout the user. User not found.",
		405: "Unable to find User. Please try again.",
		406: "Invalid or token has expired.",
		407: "Problem validating Request. Please try again.",
		408: "The password and its confirmation do not match",
		409: "Invalid old password provided",
		410: "username taken, please choose another username",
		411: "invalid user id provided",
		412: "You have provided the same existing email address",
		413: "Problem with the provided password.",
		414: "Unable to add user.",
		415: "Unable to find group.",
		416: "Unable to create Group.",
		417: "Invalid group id provided",
		418: "Unable to edit Group.",
		419: "Unable to delete Group.",
		420: "Group name already exists. Choose another",
		421: "Group code already exists. Choose another",
		424: "Invalid Request, cannot add a pending user account and provide a password at the same time.",
		425: "Unable to find record.",
		426: "Invalid id provided",
		427: "Driver not found",

		499: "Error in oAuth",
		500: "This record in locked. You cannot modify or delete it",
		
		601: "Model not found",
		611: "Invalid tenant id provided",
		
		700: "Unable to log in. Ldap connection refused!",
		701: "Unable to log in. Invalid ldap admin user.",
		702: "Unable to log in. Invalid ldap admin credentials.",
		703: "Unable to log in. Invalid ldap user credentials.",
		704: "Unable to log in. General Error.",
		705: "Unable to log in. Authentication failed.",
		706: "Missing Configuration. Contact Web Master."
	},
	
	"schema": {
		"commonFields": {
			"tId": {
				"source": ['query.tId', 'body.tId'],
				"required": true,
				"validation": {"type": "string"}
			},
			"tCode": {
				"source": ['query.tCode', 'body.tCode'],
				"required": true,
				"validation": {"type": "string"}
			},
			"keywords": {
				"source": ['query.keywords', 'body.keywords'],
				"required": false,
				"validation": {"type": "string"}
			},
			"start": {
				"required": false,
				"source": ["query.start"],
				"default": 0,
				"validation": {
					"type": "integer",
					"min": 0
				}
			},
			"limit": {
				"required": false,
				"source": ["query.limit"],
				"default": 1000,
				"validation": {
					"type": "integer",
					"max": 2000
				}
			},
			"isOwner": {
				"required": false,
				"source": ["servicesConfig.isOwner"],
				"default": true,
				"validation": {
					"type": "boolean"
				}
			},
			"model": {
				"source": ['query.model'],
				"required": false,
				"default": "mongo",
				"validation": {
					"type": "string",
					"enum": ["memory", "mongo"]
				}
			}
		},
		
		"get": {
			"/passport/login/:strategy": {
				"_apiInfo": {
					"l": "Login Through Passport",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"uracConfig": {
					"source": ['servicesConfig.urac'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"passportLogin": {
								"type": "object",
								"required": true,
								"properties": {
									"facebook": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"twitter": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"google": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"github": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									}
								}
							}
						}
					}
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github"]
					}
				}
			},
			
			"/passport/validate/:strategy": {
				"_apiInfo": {
					"l": "Login Through Passport Validate",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github"]
					}
				},
				"oauth_token": {
					"source": ['query.oauth_token'],
					"required": false,
					"validation": {
						"type": "string"
					}
				},
				"oauth_verifier": {
					"source": ['query.oauth_verifier'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			},
			
			'/join/validate': {
				"_apiInfo": {
					"l": "Validate Register",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/logout': {
				"_apiInfo": {
					"l": "Logout",
					"group": "Guest"
				}
			},
			'/forgotPassword': {
				"_apiInfo": {
					"l": "Forgot Password",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/checkUsername': {
				"_apiInfo": {
					"l": "Check If Username Exists",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/changeEmail/validate': {
				"_apiInfo": {
					"l": "Validate Change Email",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/account/getUser': {
				"_apiInfo": {
					"l": "Get User Info",
					"group": "My Account",
					"groupMain": true
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/admin/changeUserStatus': {
				"_apiInfo": {
					"l": "Change User Status",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"status": {
					"source": ['query.status'],
					"required": true,
					"validation": {"type": "string", "enum": ['active', 'inactive']}
				}
			},
			'/admin/listUsers': {
				"_apiInfo": {
					"l": "List Users",
					"group": "Administration",
					"groupMain": true
				},
				"commonFields": ["model", "start", "limit", "keywords"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/users/count': {
				"_apiInfo": {
					"l": "Total Users Count",
					"group": "Administration"
				},
				"commonFields": ["model", "keywords"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/getUser': {
				"_apiInfo": {
					"l": "Get User Record",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/admin/group/list': {
				"_apiInfo": {
					"l": "List Groups",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			
			"/admin/all": {
				"_apiInfo": {
					"l": "Get all Users & Groups",
					"group": "Administration"
				},
				"commonFields": ["model"]
			},
			'/owner/admin/users/count': {
				"_apiInfo": {
					"l": "Total Users Count",
					"group": "Owner"
				},
				"commonFields": ["model", 'tCode', 'keywords', "isOwner"]
			},
			'/owner/admin/listUsers': {
				"_apiInfo": {
					"l": "List Users",
					"group": "Owner",
					"groupMain": true
				},
				"commonFields": ["model", "tCode", "start", "limit", "keywords", "isOwner"]
			},
			'/owner/admin/changeUserStatus': {
				"_apiInfo": {
					"l": "Change User Status",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"status": {
					"source": ['query.status'],
					"required": true,
					"validation": {"type": "string", "enum": ['active', 'inactive']}
				}
			},
			'/owner/admin/getUser': {
				"_apiInfo": {
					"l": "Get User Record",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/owner/admin/group/list': {
				"_apiInfo": {
					"l": "List Groups",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"]
			},
			"/owner/admin/tokens/list": {
				"_apiInfo": {
					"l": "List Tokens",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner", "start", "limit"]
			}
		},
		"post": {
			"/login": {
				"_apiInfo": {
					"l": "Login",
					"group": "Guest",
					"groupMain": true
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/ldap/login": {
				"_apiInfo": {
					"l": "Ldap Login",
					"group": "Guest",
					"groupMain": true
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			'/join': {
				"_apiInfo": {
					"l": "Register",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				}
			},
			'/resetPassword': {
				"_apiInfo": {
					"l": "Reset Password",
					"group": "Guest"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/account/changePassword': {
				"_apiInfo": {
					"l": "Change Password",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"oldPassword": {
					"source": ['body.oldPassword'],
					"required": true,
					"validation": {"type": "string"}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/account/changeEmail': {
				"_apiInfo": {
					"l": "Change Email",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				}
			},
			'/account/editProfile': {
				"_apiInfo": {
					"l": "Edit Profile",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				}
			},
			'/admin/addUser': {
				"_apiInfo": {
					"l": "Add new User",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId', 'tCode'],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"default": "pendingNew",
					"required": false,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/editUser': {
				"_apiInfo": {
					"l": "Edit User Record",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", 'format': 'email'}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"config": {
					"source": ['body.config'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object"
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									type: 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							}
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/editUserConfig': {
				"_apiInfo": {
					"l": "Edit User Config",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['body.config'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object"
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									type: 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							}
						}
					}
				}
			},
			'/admin/group/add': {
				"_apiInfo": {
					"l": "Add new Group",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId', 'tCode'],
				"code": {
					"source": ['body.code'],
					"required": true,
					"validation": {
						"type": "string",
						"format": "alphanumeric",
						"maxLength": 20
					}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/admin/group/edit': {
				"_apiInfo": {
					"l": "Edit Group",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			"/admin/group/addUsers": {
				"_apiInfo": {
					"l": "Add Users to Group",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId'],
				"code": {
					"source": ['body.groupCode'],
					"required": true,
					"validation": {"type": "string"}
				},
				"users": {
					"source": ['body.users'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				}
			},
			
			'/owner/admin/addUser': {
				"_apiInfo": {
					"l": "Add new User",
					"group": "Owner"
				},
				"commonFields": ["model", 'tCode', "isOwner"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"default": "pendingNew",
					"required": false,
					"validation": {"type": "string", "enum": ['active', 'inactive', 'pendingNew']}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/owner/admin/editUser': {
				"_apiInfo": {
					"l": "Edit User Record",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", 'format': 'email'}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"config": {
					"source": ['body.config'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object"
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									type: 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							}
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/owner/admin/editUserConfig': {
				"_apiInfo": {
					"l": "Edit User Config",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['body.config'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object"
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									type: 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							}
						}
					}
				}
			},
			
			'/owner/admin/group/add': {
				"_apiInfo": {
					"l": "Add new Group",
					"group": "Owner"
				},
				"commonFields": ["model", 'tCode', "isOwner"],
				"code": {
					"source": ['body.code'],
					"required": true,
					"validation": {
						"type": "string",
						"format": "alphanumeric",
						"maxLength": 20
					}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/owner/admin/group/edit': {
				"_apiInfo": {
					"l": "Edit Group",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			"/owner/admin/group/addUsers": {
				"_apiInfo": {
					"l": "Add Users to Group",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"code": {
					"source": ['body.groupCode'],
					"required": true,
					"validation": {"type": "string"}
				},
				"users": {
					"source": ['body.users'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				}
			}
		},
		"put": {},
		"delete": {
			'/admin/group/delete': {
				"_apiInfo": {
					"l": "Delete Group",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/owner/admin/group/delete': {
				"_apiInfo": {
					"l": "Delete Group",
					"group": "Owner"
				},
				"commonFields": ["model", "tCode", "isOwner"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			"/owner/admin/tokens/delete": {
				"_apiInfo": {
					"l": "Delete Token",
					"group": "Owner"
				},
				"commonFields": ["tCode", "isOwner", "model"],
				"tokenId": {
					"source": ['query.tokenId'],
					"required": true,
					"validation": {"type": "string"}
				}
			}
		}
		
	}
};