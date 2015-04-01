'use strict';
module.exports = {
	//maximum string limit used if no limit is passed to getRandomString
	"serviceName": "urac",
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
		"/login": {
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
			"token": {
				"source": ['query.token'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/logout': {
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/forgotPassword': {
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
			"token": {
				"source": ['query.token'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/account/getUser': {
			"username": {
				"source": ['query.username'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		'/account/changePassword': {
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
		'/admin/listUsers': {},
		'/admin/editUser': {
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
			"status": {
				"source": ['body.status'],
				"required": true,
				"validation": {"type": "string", enum: ['active', 'inactive']}
			}
		},
		'/admin/group/list': {},
		'/admin/group/add': {
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
			"gId": {
				"source": ['query.gId'],
				"required": true,
				"validation": {"type": "string"}
			}
		},
		"/admin/group/addUsers": {
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
						"type": "string",
						'required': true
					}
				}
			}
		},
		"/admin/user/editGroups": {}
		
	}
};