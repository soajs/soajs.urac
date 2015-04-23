'use strict';
var accessSchema = {
	"oneOf": [
		{"type": "boolean", "required": false},
		{"type": "array", "minItems": 1, "items": {"type": "string", "required": true}, "required": false}
	]
};
var acl={
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
	//maximum string limit used if no limit is passed to getRandomString
	"serviceName": "urac",
	"servicePort": 4001,
	"hashIterations": 1024,
	"seedLength": 32,
	"extKeyRequired": true,
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
		
		500: "This record in locked. You cannot delete it",

		600: "Database connection error"
	},

	"schema": {
		"commonFields": {

		},

		"/login": {
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
				"l": "Logout",
				"group": "Guest"
			},
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/forgotPassword': {
			"_apiInfo":{
				"l": "Forgot Password",
				"group": "Guest"
			},
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			},
			"email": {
				"source": ['query.email'],
				"required": true,
				"validation": {"type": "string", format: "email"}
			}
		},
		'/resetPassword': {
			"_apiInfo":{
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
		'/changeEmail/validate': {
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
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
				"validation": {"type": "string"}
			}
		},
		'/admin/addUser': {
			"_apiInfo":{
				"l": "Add new User",
				"group": "Administration"
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
				"validation": {"type": "string", format: "email"}
			},
			"profile": {
				"source": ['body.profile'],
				"required": false,
				"validation": {"type": "string"}
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
			}
		},
		'/admin/changeUserStatus': {
			"_apiInfo":{
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
			"_apiInfo":{
				"l": "List Users",
				"group": "Administration",
				"groupDefault": true
			}
		},
		'/admin/getUser': {
			"_apiInfo":{
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
			"_apiInfo":{
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
						"keys":{
							"type": "object"
						},
						"packages":{
							"type": "object",
							"required": false,
							"additionalProperties" : {
								type:'object',
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
			}
		},
		'/admin/group/list': {
			"_apiInfo":{
				"l": "List Groups",
				"group": "Administration"
			}
		},
		'/admin/group/add': {
			"_apiInfo":{
				"l": "Add new Group",
				"group": "Administration"
			},
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
			"_apiInfo":{
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
			"_apiInfo":{
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
			"_apiInfo":{
				"l": "Add Users to Group",
				"group": "Administration"
			},
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
		"/admin/user/editGroups": {
			"_apiInfo":{
				"l": "Edit Multiple Groups",
				"group": "Administration"
			}
		}
	}
};