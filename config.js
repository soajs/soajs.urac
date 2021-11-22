"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

module.exports = {
    "type": 'service',
    'subType': 'soajs',
    "description": "User Registration and Access Control ( URAC ), is a SOAJS multi-tenant service to manage users accounts, groups and access levels for all tenants.",
    "prerequisites": {
        "cpu": '',
        "memory": ''
    },
    "serviceVersion": 3,
    "serviceName": "urac",
    "serviceGroup": "Gateway",
    "servicePort": 4001,
    "requestTimeout": 30,
    "requestTimeoutRenewal": 5,
    "extKeyRequired": true,
    "oauth": true,
    "urac": true,
    "maintenance": {
        "readiness": "/heartbeat",
        "port": {"type": "maintenance"},
        "commands": [
            {"label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo"},
            {"label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info"}
        ]
    },
    "tags": ["users", "registration", "groups", "membership", "join"],
    "attributes": {
        "authentication": ["multitenant", "roaming", "invitation"],
        "role": ["management", "acl"]
    },
    "program": ["soajs"],
    "documentation": {
        "readme": "/README.md",
        "release": "/RELEASE.md"
    },
    //-------------------------------------
    "hashIterations": 12,

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
        533: "No changes to update",
        534: "Main tenant cannot invite users",
        535: "Sub tenant cannot self invite a user.",
        536: "User is already in the tenant tenancy.",
        537: "Make sure to use the Email or Phone number related to this invite code.",

        598: "Problem with the used token and code.",
        599: "Token has expired.",
        600: "unable to find token.",
        601: "Model not found.",
        602: "Model error: ",
    },

    "schema": {
        "commonFields": {
            "keywords": {
                "source": ['query.keywords', 'body.keywords'],
                "validation": {"type": "string"}
            },
            "start": {
                "source": ["query.start", "body.start"],
                "default": 0,
                "validation": {
                    "type": "integer",
                    "min": 0
                }
            },
            "skip": {
                "source": ["query.skip", "body.skip"],
                "default": 0,
                "validation": {
                    "type": "integer",
                    "min": 0
                }
            },
            "limit": {
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
            '/password/forgot/code': {
                "_apiInfo": {
                    "l": "Forgot password by username as (username or email) - a code will be emailed",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
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
            '/validate/join/code': {
                "_apiInfo": {
                    "l": "To validate user account after joining",
                    "group": "Guest join"
                },
                "token": {
                    "source": ['query.token'],
                    "validation": {"type": "string"}
                },
                "code": {
                    "source": ['query.code'],
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
            '/emailToken': {
                "_apiInfo": {
                    "l": "Check if user (username or email) status if pendingJoin or pendingNew and send a new token email",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/resend/code': {
                "_apiInfo": {
                    "l": "Check if user (username or email) status if pendingJoin and send a new token and new code",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "confirmation": {
                    "source": ['query.confirmation'],
                    "default": "email",
                    "validation": {"type": "string", "enum": ["email", "emailAndPhone", "phone"]}
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
                    "group": "My account"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/user/tenants': {
                "_apiInfo": {
                    "l": "Get logged in user tenants",
                    "group": "User administration"
                }
            },
            '/user/me': {
                "_apiInfo": {
                    "l": "Get logged in user account information ",
                    "group": "My account"
                }
            },
            '/users': {
                "_apiInfo": {
                    "l": "List users matching certain keywords",
                    "group": "User",
                },
                "commonFields": ["skip", "limit", "keywords"],
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active']
                    }
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
                    "group": "User administration"
                },
                "commonFields": ["start", "limit", "keywords"],
                "config": {
                    "source": ['query.config'],
                    "validation": {"type": "boolean"}
                },
                "scope": {
                    "source": ['query.scope'],
                    "validation": {"type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"]}
                },
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active']
                    }
                }
            },
            '/admin/users/count': {
                "_apiInfo": {
                    "l": "Get users count matching certain keywords",
                    "group": "User administration"
                },
                "commonFields": ["keywords"],
                "scope": {
                    "source": ['query.scope'],
                    "validation": {"type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"]}
                }
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
                    "validation": {"type": "string"}
                },
                "code": {
                    "source": ['query.code'],
                    "validation": {"type": "string"}
                }
            },

            '/admin/all': {
                "_apiInfo": {
                    "l": "Get all users and groups of a main tenant",
                    "group": "Administration"
                },
                "scope": {
                    "source": ['query.scope'],
                    "validation": {"type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"]}
                }
            },
            '/admin/tokens': {
                "_apiInfo": {
                    "l": "Get tokens for a specific service",
                    "group": "Administration"
                },
                "commonFields": ["start", "limit"],
                "service": {
                    "source": ['query.service'],
                    "validation": {"type": "string", "enum": ["inviteToJoin", "joinInvite"]}
                }
            }
        },

        "post": {
            '/email': {
                "_apiInfo": {
                    "l": "Send custom email",
                    "group": "Custom email"
                },
                "email": {
                    "source": ['body.email'],
                    "validation": {"type": "string", "format": "email"}
                },
                "id": {
                    "source": ['body.id'],
                    "validation": {"type": "string"}
                },
                "what": {
                    "source": ['body.what'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "data": {
                    "source": ['body.data'],
                    "validation": {
                        "type": "object"
                    }
                }
            },
            '/invite': {
                "_apiInfo": {
                    "l": "Invite to join - a link to join will be sent by email and a code will be sent by sms or email.",
                    "group": "User administration"
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
                "phone": {
                    "source": ['body.phone'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/join/invite': {
                "_apiInfo": {
                    "l": "Join and create an account by invitation",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
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
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": {"type": "object"}
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": {"type": "string"}
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "code": {
                    "source": ['body.code'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "default": "email",
                    "validation": {"type": "string", "enum": ["email", "emailAndPhone", "phone"]}
                }
            },
            '/join': {
                "_apiInfo": {
                    "l": "Join and create an account",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
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
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": {"type": "object"}
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": {"type": "string"}
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": {"type": "string"}
                }
            },
            '/join/code': {
                "_apiInfo": {
                    "l": "Join and create an account",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
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
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": {"type": "object"}
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": {"type": "string"}
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": {"type": "string"}
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "default": "email",
                    "validation": {"type": "string", "enum": ["email", "emailAndPhone", "phone"]}
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
                    "validation": {"type": "object"}
                },
                "groups": {
                    "source": ['body.groups'],
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
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'inactive', 'pendingNew']
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "validation": {"type": "string"}
                },
                "pin": {
                    "source": ['body.pin'],
                    "validation": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "code": {
                                "type": 'boolean'
                            },
                            "allowed": {
                                "type": 'boolean'
                            }
                        },
                        "required": ["code", "allowed"]
                    }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": {"type": "string"}
                }
            },

            '/admin/users/ids': {
                "_apiInfo": {
                    "l": "List users by Id",
                    "group": "User administration"
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
                            "additionalProperties": false,
                            "properties": {
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
                            "required": ["product", "packages"]
                        }
                    }
                },
                "environments": {
                    "source": ['body.environments'],
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
            '/admin/groups': {
                "_apiInfo": {
                    "l": "Add groups",
                    "group": "Group administration"
                },
                "tenant": {
                    "source": ['body.tenant'],
                    "validation": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"]
                    }
                },
                "groups": {
                    "source": ['body.groups'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "minItems": 1,
                            "properties": {
                                "code": {
                                    "type": "string",
                                    "format": "alphanumeric",
                                    "maxLength": 20
                                },
                                "name": {
                                    "type": "string"
                                },
                                "description": {
                                    "type": "description"
                                },
                                "packages": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "minItems": 1,
                                        "properties": {
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
                                        }
                                    }
                                }
                            },
                            "requires": ["code", "name", "description", "packages"]
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
            },
            '/admin/user': {
                "_apiInfo": {
                    "l": "Delete user",
                    "group": "User administration"
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

            '/account/email/code': {
                "_apiInfo": {
                    "l": "Change account's email by id - a code will be emailed",
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
                    "validation": {
                        "type": "string",
                        "pattern": /^[a-zA-Z0-9_-]+$/
                    }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "validation": {"type": "string"}
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": {"type": "string"}
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": {"type": "object"}
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": {"type": "string"}
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
                    "validation": {
                        "type": "string",
                        "pattern": /^[a-zA-Z0-9_-]+$/
                    }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "validation": {"type": "string"}
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": {"type": "string"}
                },
                "email": {
                    "source": ['body.email'],
                    "validation": {"type": "string", 'format': 'email'}
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "status": {
                    "source": ['body.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'inactive', 'pendingNew', 'pendingJoin']
                    }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": {"type": "object"}
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": {"type": "string"}
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": {"type": "string"}
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
                                        "type": "boolean"
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
                    "validation": {"type": "string"}
                },
                "packages": {
                    "source": ['body.packages'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "minItems": 1,
                            "properties": {
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
                            "properties": {
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


            '/admin/user/self/invite': {
                "_apiInfo": {
                    "l": "Self Invite user by id or username as username or email",
                    "group": "User administration"
                },
                "pin": {
                    "source": ['body.pin'],
                    "validation": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "code": {
                                "type": "boolean"
                            },
                            "allowed": {
                                "type": "boolean"
                            }
                        },
                        "required": ["code", "allowed"]
                    }
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "tenant": {
                    "required": true,
                    "source": ['body.tenant'],
                    "validation": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "code": {
                                "type": "string"
                            },
                            "id": {
                                "type": "string"
                            }
                        },
                        "required": ["code", "id"]
                    }
                }
            },

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
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "boolean"
                                        },
                                        "allowed": {
                                            "type": "boolean"
                                        }
                                    },
                                    "required": ["code", "allowed"]
                                },
                                "groups": {
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
