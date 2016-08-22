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
	"serviceVersion": 1,
	"serviceName": "urac",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4001,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"hashIterations": 1024,
	"encryptPWDonAdd": true,
	"seedLength": 32,
	"extKeyRequired": true,
	"oauth": false,
	"session": true,
	
	"cmd": ["/etc/init.d/postfix start"],
	
	"maxStringLimit": 30,
	"errors": {
		400: "Problem with the provided password.",
		401: "Unable to log in the user. User not found.",
		402: "User account already exists.",
		403: "Unable to register user. please try again.",
		404: "Unable to logout the user. User not found.",
		405: "Unable to find User. Please try again.",
		406: "Invalid or token has expired.",
		407: "Problem validating Request. Please try again.",
		408: "The password and its confirmation do not match",
		409: "Invalid old password provided",
		410: "username taken, please choose another username",
		411: "invalid user id provided",
		412: "You have provided the same existing email address",
		413: "Invalid profile field provided. Profile should be a stringified object.",
		414: "Unable to add user.",
		415: "Unable to find group.",
		416: "Unable to create Group.",
		417: "Invalid group id provided",
		418: "Unable to edit Group.",
		419: "Unable to delete Group.",
		420: "Group name already exists. Choose another",
		421: "Group code already exists. Choose another",
		424: "Invalid Request, cannot add a pending user account and provide a password at the same time.",
		
		500: "This record in locked. You cannot modify or delete it",
		
		600: "Database connection error",
		611: "Invalid tenant id provided"
	},
	
	"schema": {
		"commonFields": {
			"tId": {
				"source": ['body.tId', 'query.tId'],
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
			}
		},
		
		"/login": {
			"_apiInfo": {
				"l": "Login",
				"group": "Guest",
				"groupDefault": true
			},
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
		'/join/validate': {
			"_apiInfo": {
				"l": "Validate Register",
				"group": "Guest"
			},
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
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			}
			//"email": {
			//	"source": ['query.email'],
			//	"required": true,
			//	"validation": {"type": "string", format: "email"}
			//}
		},
		'/resetPassword': {
			"_apiInfo": {
				"l": "Reset Password",
				"group": "Guest"
			},
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
		'/checkUsername': {
			"_apiInfo": {
				"l": "Check If Username Exists",
				"group": "Guest"
			},
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
				"groupDefault": true
			},
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/account/changePassword': {
			"_apiInfo": {
				"l": "Change Password",
				"group": "My Account"
			},
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
			"uId": {
				"source": ['query.uId'],
				"required": true,
				"validation": {"type": "string"}
			},
			"email": {
				"source": ['body.email'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/account/editProfile': {
			"_apiInfo": {
				"l": "Edit Profile",
				"group": "My Account"
			},
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
			"commonFields": ['tId', 'tCode'],
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
				"validation": {"type": "string", enum: ['active', 'inactive']}
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
		'/admin/changeUserStatus': {
			"_apiInfo": {
				"l": "Change User Status",
				"group": "Administration"
			},
			"uId": {
				"source": ['query.uId'],
				"required": true,
				"validation": {"type": "string"}
			},
			"status": {
				"source": ['query.status'],
				"required": true,
				"validation": {"type": "string", enum: ['active', 'inactive']}
			}
		},
		'/admin/listUsers': {
			"_apiInfo": {
				"l": "List Users",
				"group": "Administration",
				"groupDefault": true
			},
			"commonFields": ["start", "limit", "keywords"],
			"tId": {
				"source": ['body.tId', 'query.tId'],
				"required": false,
				"validation": {"type": "string"}
			}
		},
		'/admin/users/count': {
			"_apiInfo": {
				"l": "Total Users Count",
				"group": "Administration"
			},
			"commonFields": ["keywords"],
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
			"uId": {
				"source": ['query.uId'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/admin/editUser': {
			"_apiInfo": {
				"l": "Edit User Record",
				"group": "Administration"
			},
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
					enum: ['active', 'inactive', 'pendingNew']
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
		'/admin/group/list': {
			"_apiInfo": {
				"l": "List Groups",
				"group": "Administration"
			},
			"tId": {
				"source": ['body.tId', 'query.tId'],
				"required": false,
				"validation": {"type": "string"}
			}
		},
		'/admin/group/add': {
			"_apiInfo": {
				"l": "Add new Group",
				"group": "Administration"
			},
			"commonFields": ['tId', 'tCode'],
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
		'/admin/group/delete': {
			"_apiInfo": {
				"l": "Delete Group",
				"group": "Administration"
			},
			"gId": {
				"source": ['query.gId'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		"/admin/group/addUsers": {
			"_apiInfo": {
				"l": "Add Users to Group",
				"group": "Administration"
			},
			"commonFields": ['tId'],
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
		"/admin/all": {
			"_apiInfo": {
				"l": "Get all Users & Groups",
				"group": "Administration"
			}
		},
		
		'/owner/admin/users/count': {
			"_apiInfo": {
				"l": "Total Users Count",
				"group": "Owner"
			},
			"commonFields": ['tCode', 'keywords']
		},
		'/owner/admin/addUser': {
			"_apiInfo": {
				"l": "Add new User",
				"group": "Owner"
			},
			"commonFields": ['tCode'],
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
				"validation": {"type": "string", enum: ['active', 'inactive']}
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
		'/owner/admin/listUsers': {
			"_apiInfo": {
				"l": "List Users",
				"group": "Owner",
				"groupDefault": true
			},
			"commonFields": ["tCode", "start", "limit", "keywords"]
		},
		'/owner/admin/changeUserStatus': {
			"_apiInfo": {
				"l": "Change User Status",
				"group": "Owner"
			},
			"commonFields": ["tCode"],
			"uId": {
				"source": ['query.uId'],
				"required": true,
				"validation": {"type": "string"}
			},
			"status": {
				"source": ['query.status'],
				"required": true,
				"validation": {"type": "string", enum: ['active', 'inactive']}
			}
		},
		'/owner/admin/getUser': {
			"_apiInfo": {
				"l": "Get User Record",
				"group": "Owner"
			},
			"commonFields": ["tCode"],
			"uId": {
				"source": ['query.uId'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/owner/admin/editUser': {
			"_apiInfo": {
				"l": "Edit User Record",
				"group": "Owner"
			},
			"commonFields": ["tCode"],
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
					enum: ['active', 'inactive', 'pendingNew']
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
			"commonFields": ["tCode"],
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

		'/owner/admin/group/list': {
			"_apiInfo": {
				"l": "List Groups",
				"group": "Owner"
			},
			"commonFields": ["tCode"]
		},
		'/owner/admin/group/add': {
			"_apiInfo": {
				"l": "Add new Group",
				"group": "Owner"
			},
			"commonFields": ['tCode'],
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
			"commonFields": ["tCode"],
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
		'/owner/admin/group/delete': {
			"_apiInfo": {
				"l": "Delete Group",
				"group": "Owner"
			},
			"commonFields": ["tCode"],
			"gId": {
				"source": ['query.gId'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		"/owner/admin/group/addUsers": {
			"_apiInfo": {
				"l": "Add Users to Group",
				"group": "Owner"
			},
			"commonFields": ["tCode"],
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
	}
};