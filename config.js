"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 3,
	"serviceName": "urac",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4001,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"extKeyRequired": true,
	"oauth": true,
	
	"hashIterations": 1024,
	"seedLength": 32,
	
	
	"pinConfiguration": {
		"charLength": 4,
		"characters": "0123456789"
	},
	
	"errors": {
		400: "Business logic required data are missing.",
		402: "User Already exists.",
		420: "Unable to find group.",
		
		520: "Unable to find user.",
		521: "User account already exists.",
		522: "The password and its confirmation do not match.",
		523: "The provided current password is not correct.",
		524: "Cannot join with a sub tenant key",
		525: "Unable to generate pin at this time.",
		526: "Email already exists.",
		527: "username or id is required to invite user.",
		528: "Cannot invite user with locked record.",
		529: "User has already been invited.",
		530: "Users array is required.",
		531: "Error while trying to invite users.",
		532: "user [id | username | email] is required",
		
		599: "Token has expired.",
		600: "unable to find token.",
		601: "Model not found.",
		602: "Model error: ",
	},
	
	"schema": {
		"commonFields": {
			"keywords": {
				"source": ['query.keywords', 'body.keywords'],
				"required": false,
				"validation": {"type": "string"}
			},
			"start": {
				"required": false,
				"source": ["query.start", "body.start"],
				"default": 0,
				"validation": {
					"type": "integer",
					"min": 0
				}
			},
			"limit": {
				"required": false,
				"source": ["query.limit", "body.limit"],
				"default": 1000,
				"validation": {
					"type": "integer",
					"max": 2000
				}
			},
			"user": {
				"source": ['body.user'],
				"required": true,
				"validation": {
					"type": "object",
					"properties": {
						"oneOf": [
							{
								"id": {
									"type": "string",
									"required": true
								},
								"username": {
									"type": "string",
									"required": true
								},
								"email": {
									"type": "string",
									'format': 'email',
									"required": true
								}
							}
						]
					}
				}
			}
		},
		"get": {
			
			'/password/forgot': {
				"_apiInfo": {
					"l": "Forgot password by username as (username or email) - an email will be sent with a link to reset the password",
					"group": "My account guest"
				},
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/validate/join': {
				"_apiInfo": {
					"l": "To validate user account after joining",
					"group": "Guest join"
				},
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/checkUsername': {
				"_apiInfo": {
					"l": "Check if a username as (username or email) is available or taken",
					"group": "Guest join"
				},
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/validate/changeEmail': {
				"_apiInfo": {
					"l": "To validate change email",
					"group": "My account guest"
				},
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/user': {
				"_apiInfo": {
					"l": "Get user account information by username as (username or email)",
					"group": "My account",
					"groupMain": true
				},
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			'/admin/user': {
				"_apiInfo": {
					"l": "Get user by id",
					"group": "User administration"
				},
				"id": {
					"source": ['query.id'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/admin/users': {
				"_apiInfo": {
					"l": "List users matching certain keywords",
					"group": "User Administration",
					"groupMain": true
				},
				"commonFields": ["start", "limit", "keywords"],
				"config": {
					"source": ['query.config'],
					"required": false,
					"validation": {"type": "boolean"}
				}
			},
			'/admin/users/count': {
				"_apiInfo": {
					"l": "Get users count matching certain keywords",
					"group": "User administration"
				},
				"commonFields": ["keywords"]
			},
			
			'/admin/groups': {
				"_apiInfo": {
					"l": "List all groups",
					"group": "Group administration"
				}
			},
			'/admin/group': {
				"_apiInfo": {
					"l": "Get group by id or code",
					"group": "Group administration"
				},
				"id": {
					"source": ['query.id'],
					"required": false,
					"validation": {"type": "string"}
				},
				"code": {
					"source": ['query.code'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			
			'/admin/all': {
				"_apiInfo": {
					"l": "Get all users and groups of a main tenant",
					"group": "Administration"
				}
			}
		},
		
		"post": {
			'/join': {
				"_apiInfo": {
					"l": "Join and create an account",
					"group": "Guest Join"
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
                        "minLength": 5,
                        "maxLength": 50,
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
					"validation": {"type": "string", "format": "email"}
				}
			},
			
			'/admin/user': {
				"_apiInfo": {
					"l": "Add user",
					"group": "User administration"
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
                        "minLength": 5,
                        "maxLength": 50,
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
					"validation": {"type": "string", "format": "email"}
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
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"required": true,
								"type": 'boolean'
							},
							"allowed": {
								"required": true,
								"type": 'boolean'
							}
						},
						"additionalProperties": false
					}
				}
			},
			
			'/admin/users/ids': {
				"_apiInfo": {
					"l": "List users by Id",
					"group": "User administration",
					"groupMain": true
				},
				"commonFields": ["start", "limit"],
				"ids": {
					"source": ['body.ids'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1
						}
					}
				},
				"config": {
					"source": ['body.config'],
					"required": false,
					"validation": {"type": "boolean"}
				}
			},
			
			'/admin/group': {
				"_apiInfo": {
					"l": "Add group",
					"group": "Group administration"
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
				},
				"packages": {
					"source": ['body.packages'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "object",
							"minItems": 1,
							"patternProperties": {
								"product": {
									"type": "string"
								},
								"packages": {
									"type": "array",
									"items": {
										"type": "string",
										"minItems": 1,
									}
								}
							},
							"additionalProperties": false
						}
					}
				},
				"environments": {
					"source": ['body.environments'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1,
							"pattern": "^([A-Za-z]+)$"
						}
					}
				}
			}
		},
		
		"delete": {
			'/admin/group': {
				"_apiInfo": {
					"l": "Delete group",
					"group": "Group administration"
				},
				"id": {
					"source": ['query.id'],
					"required": true,
					"validation": {"type": "string"}
				}
			}
		},
		
		"put": {
			'/password/reset': {
				"_apiInfo": {
					"l": "Reset password",
					"group": "My account guest"
				},
				"token": {
					"source": ['body.token'],
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
			
			'/account/password': {
				"_apiInfo": {
					"l": "Change account's password by id",
					"group": "My account"
				},
				"id": {
					"source": ['body.id'],
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
			
			'/account/email': {
				"_apiInfo": {
					"l": "Change account's email by id",
					"group": "My account"
				},
				"id": {
					"source": ['body.id'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", "format": "email"}
				}
			},
			
			'/account': {
				"_apiInfo": {
					"l": "Edit account's information by id",
					"group": "My account"
				},
				"id": {
					"source": ['body.id'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": false,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": false,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": false,
					"validation": {"type": "string"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				}
			},
			
			'/admin/user': {
				"_apiInfo": {
					"l": "Edit user by id",
					"group": "User administration"
				},
				"id": {
					"source": ['body.id'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": false,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": false,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": false,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": false,
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
					"required": false,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				}
			},
			'/admin/user/groups': {
				"_apiInfo": {
					"l": "Edit user's groups by id, username, or email",
					"group": "User administration"
				},
				"commonFields": ["user"],
				"groups": {
					"source": ['body.groups'],
					"required": true,
					"validation": {
						"type": "array",
						"uniqueItems": true,
						"items": {
							"type": "string"
						}
					}
				}
			},
			'/admin/user/pin': {
				"_apiInfo": {
					"l": "Edit, reset, or delete user's pin information by id, username, or email",
					"group": "User administration"
				},
				"commonFields": ["user"],
				"pin": {
					"source": ['body.pin'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"oneOf": [
								{
									"delete": {
										"type": "boolean",
										"required": true
									}
								},
								{
									"reset": {
										"type": "boolean",
										"required": true
									},
									"allowed": {
										"type": "boolean",
										"required": false
									}
								}
							]
						}
					}
				}
			},
			
			'/admin/user/status': {
				"_apiInfo": {
					"l": "Change the status of a user by id",
					"group": "User administration"
				},
				"id": {
					"source": ['body.id'],
					"required": true,
					"validation": {"type": "string"}
				},
				"status": {
					"source": ['body.status'],
					"required": true,
					"validation": {"type": "string", "enum": ['active', 'inactive']}
				}
			},
			
			'/admin/group': {
				"_apiInfo": {
					"l": "Edit group by id",
					"group": "Group administration"
				},
				"id": {
					"source": ['body.id'],
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
					"required": false,
					"validation": {"type": "string"}
				},
				"packages": {
					"source": ['body.packages'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "object",
							"minItems": 1,
							"patternProperties": {
								"product": {
									"type": "string"
								},
								"packages": {
									"type": "array",
									"items": {
										"type": "string",
										"minItems": 1,
									}
								}
							},
							"additionalProperties": false
						}
					}
				},
				"environments": {
					"source": ['body.environments'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1,
							"pattern": "^([A-Za-z]+)$"
						}
					}
				}
			},
			
			'/admin/groups/environments': {
				"_apiInfo": {
					"l": "Update environment(s) of group(s) by code(s) or id(s)",
					"group": "Group administration"
				},
				"environments": {
					"source": ['body.environments'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1,
							"pattern": "^([A-Za-z]+)$"
						}
					}
				},
				"groups": {
					"source": ['body.groups'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"oneOf": [
								{
									"ids": {
										"type": "array",
										"required": true
									},
									"codes": {
										"type": "array",
										"required": true
									}
								}
							]
						}
					}
				}
			},
			
			'/admin/groups/packages': {
				"_apiInfo": {
					"l": "Update package(s) of group(s) by code(s) or id(s)",
					"group": "Group administration"
				},
				"packages": {
					"source": ['body.packages'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "object",
							"minItems": 1,
							"patternProperties": {
								"product": {
									"type": "string"
								},
								"packages": {
									"type": "array",
									"items": {
										"type": "string",
										"minItems": 1
									}
								}
							},
							"additionalProperties": false
						}
					}
				},
				"groups": {
					"source": ['body.groups'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"oneOf": [
								{
									"ids": {
										"type": "array",
										"required": true
									},
									"codes": {
										"type": "array",
										"required": true
									}
								}
							]
						}
					}
				}
			},
			
			/*
			*
			* since we have invite and un-invite users, no need for these 2
			*

			'/admin/user/invite': {
				"_apiInfo": {
					"l": "Invite user by id or username as username or email",
					"group": "User administration"
				},
				"id": {
					"source": ['body.id'],
					"required": false,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
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
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"type": "boolean",
								"required": true
							},
							"allowed": {
								"type": "boolean",
								"required": true
							}
						}
					}
				}
			},

			"/admin/user/uninvite": {
				"_apiInfo": {
					"l": "un-Invite user by id or username as username or email",
					"group": "User administration"
				},
				"id": {
					"source": ['body.id'],
					"required": false,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			*/
			
			'/admin/users/invite': {
				"_apiInfo": {
					"l": "Invite users by id, username or email",
					"group": "User administration"
				},
				"users": {
					"source": ['body.users'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"maxItems": 100,
						"items": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"user": {
									"type": "object",
									"properties": {
										"oneOf": [
											{
												"id": {
													"type": "string",
													"required": true
												},
												"username": {
													"type": "string",
													"required": true
												},
												"email": {
													"type": "string",
													'format': 'email',
													"required": true
												}
											}
										]
									}
								},
								"pin": {
									"required": false,
									"type": "object",
									"properties": {
										"code": {
											"type": "boolean",
											"required": true
										},
										"allowed": {
											"type": "boolean",
											"required": true
										}
									}
								},
								"groups": {
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
					}
				}
			},
			
			'/admin/users/uninvite': {
				"_apiInfo": {
					"l": "un-Invite users by id, username or email",
					"group": "User administration"
				},
				"users": {
					"source": ['body.users'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"maxItems": 100,
						"items": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"user": {
									"type": "object",
									"properties": {
										"oneOf": [
											{
												"id": {
													"type": "string",
													"required": true
												},
												"username": {
													"type": "string",
													"required": true
												},
												"email": {
													"type": "string",
													'format': 'email',
													"required": true
												}
											}
										]
									}
								}
							}
						}
					}
				}
			}
		}
	}
};