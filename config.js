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
        "port": { "type": "maintenance" },
        "commands": [
            { "label": "Reload Registry", "path": "/reloadRegistry", "icon": "fas fa-undo" },
            { "label": "Resource Info", "path": "/resourceInfo", "icon": "fas fa-info" }
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
    "interConnect": [
        {
            "name": "oauth",
            "version": "1"
        }
    ],
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
        538: "Phone already exists.",
        539: "A signed in user is required.",
        540: "The id does not match the signed in user.",
        541: "Email or id is required.",

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
                "validation": { "type": "string", "description": "Case-insensitive search text matched against user names (and email in admin lists)" }
            },
            "start": {
                "source": ["query.start", "body.start"],
                "default": 0,
                "validation": {
                    "type": "integer",
                    "min": 0,
                    "description": "Number of records to skip (offset), default 0"
                }
            },
            "skip": {
                "source": ["query.skip", "body.skip"],
                "default": 0,
                "validation": {
                    "type": "integer",
                    "min": 0,
                    "description": "Number of records to skip (offset), default 0"
                }
            },
            "limit": {
                "source": ["query.limit", "body.limit"],
                "default": 1000,
                "validation": {
                    "type": "integer",
                    "max": 2000,
                    "description": "Maximum records to return, default 1000, max 2000"
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
                    },
                    "description": "Target user, identified by exactly one of id, username or email"
                }
            }
        },
        "get": {
            '/password/forgot/code': {
                "_apiInfo": {
                    "l": "Start password reset by username or email; emails a 6-digit reset code",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email of the account" }
                }
            },
            '/password/forgot': {
                "_apiInfo": {
                    "l": "Start password reset by username or email; emails a reset link with a token",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email of the account" }
                }
            },
            '/validate/join/code': {
                "_apiInfo": {
                    "l": "Validate a joined account with the joinInvite code and activate it",
                    "group": "Guest join"
                },
                "token": {
                    "source": ['query.token'],
                    "validation": { "type": "string", "description": "Token from the join email link; not needed when confirmation was phone" }
                },
                "code": {
                    "source": ['query.code'],
                    "required": true,
                    "validation": { "type": "string", "description": "Validation code sent by SMS or email" }
                }
            },
            '/validate/join': {
                "_apiInfo": {
                    "l": "Validate a joined account with the emailed token or code; activates the user",
                    "group": "Guest join"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": { "type": "string", "description": "Token from the join email link, or the emailed 6-digit join code" }
                }
            },
            '/checkUsername': {
                "_apiInfo": {
                    "l": "Check if a username or email is already taken; returns true if taken",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email to check" }
                }
            },
            '/emailToken': {
                "_apiInfo": {
                    "l": "Resend pending-account email: set-password link (pendingNew) or join link",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email of a pendingNew or pendingJoin account" }
                }
            },
            '/resend/code': {
                "_apiInfo": {
                    "l": "Resend join validation to a pendingJoin user as email code, link or SMS code",
                    "group": "My account guest"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email of a pendingJoin account" }
                },
                "confirmation": {
                    "source": ['query.confirmation'],
                    "default": "email",
                    "validation": { "type": "string", "enum": ["email", "emailAndPhone", "phone"], "description": "Channel: email (code or link per config), phone (SMS code), emailAndPhone (link plus SMS code)" }
                }
            },
            '/validate/changeEmail': {
                "_apiInfo": {
                    "l": "Confirm an email change with the emailed token or code; must be same user",
                    "group": "My account guest"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": { "type": "string", "description": "Token from the change-email link, or the 6-digit code" }
                }
            },
            '/validate/changePhone': {
                "_apiInfo": {
                    "l": "Confirm a phone change with the SMS code; must be the same logged-in user",
                    "group": "My account"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": { "type": "string", "description": "6-digit code sent by SMS to the new phone" }
                }
            },
            '/user': {
                "_apiInfo": {
                    "l": "Get a user by username or email, including allowed tenants",
                    "group": "My account"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": { "type": "string", "description": "Username or email of the user" }
                },
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'pending']
                    }
                }
            },
            '/user/tenants': {
                "_apiInfo": {
                    "l": "Get the logged-in user's tenant, groups and allowed tenants",
                    "group": "User administration"
                }
            },
            '/user/me': {
                "_apiInfo": {
                    "l": "Get the logged-in user's account (active users only)",
                    "group": "My account"
                }
            },
            '/users': {
                "_apiInfo": {
                    "l": "List basic info of users in the caller's tenant; keyword search, paginated",
                    "group": "User",
                },
                "commonFields": ["skip", "limit", "keywords"],
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active'],
                        "description": "Only return users with this status"
                    }
                }
            },
            '/admin/user': {
                "_apiInfo": {
                    "l": "Get an active user by id, including allowed tenants",
                    "group": "User administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "User id" }
                }
            },
            '/admin/users': {
                "_apiInfo": {
                    "l": "List users by keyword, scope and status; paginated, sorted by first name",
                    "group": "User administration"
                },
                "commonFields": ["start", "limit", "keywords"],
                "config": {
                    "source": ['query.config'],
                    "validation": { "type": "boolean", "description": "Include config.allowedTenants in results (pin codes hidden)" }
                },
                "scope": {
                    "source": ['query.scope'],
                    "validation": { "type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"], "description": "myTenancy: users of caller tenant; otherTenancy: users of other tenants; otherTenancyInvited: other-tenant users invited to caller tenant" }
                },
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active'],
                        "description": "Only return users with this status"
                    }
                }
            },
            '/admin/users/count': {
                "_apiInfo": {
                    "l": "Count users matching keywords and scope",
                    "group": "User administration"
                },
                "commonFields": ["keywords"],
                "scope": {
                    "source": ['query.scope'],
                    "validation": { "type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"], "description": "myTenancy: users of caller tenant; otherTenancy: users of other tenants; otherTenancyInvited: other-tenant users invited to caller tenant" }
                }
            },
            '/api-v2/admin/users': {
                "_apiInfo": {
                    "l": "List users with total count; keyword, scope, status and tenant filters",
                    "group": "User administration"
                },
                "commonFields": ["start", "limit", "keywords"],
                "config": {
                    "source": ['query.config'],
                    "validation": { "type": "boolean", "description": "Include config.allowedTenants in results (pin codes hidden)" }
                },
                "scope": {
                    "source": ['query.scope'],
                    "validation": { "type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"], "description": "myTenancy: users of the tenant; otherTenancy: users of other tenants; otherTenancyInvited: other-tenant users invited to the tenant" }
                },
                "status": {
                    "source": ['query.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active'],
                        "description": "Only return users with this status"
                    }
                },
                "tenant": {
                    "source": ['query.tenant'],
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} to filter for instead of the caller's tenant"
                    }
                }
            },

            '/admin/groups': {
                "_apiInfo": {
                    "l": "List all groups of the caller's tenant",
                    "group": "Group administration"
                }
            },
            '/admin/groups/tenant': {
                "_apiInfo": {
                    "l": "List all groups of a given tenant id",
                    "group": "Group administration"
                },
                "tenantId": {
                    "source": ['query.tenantId'],
                    "required": true,
                    "validation": { "type": "string", "description": "Id of the tenant whose groups are listed" }
                }
            },
            '/admin/group': {
                "_apiInfo": {
                    "l": "Get a group of the caller's tenant by id or code",
                    "group": "Group administration"
                },
                "id": {
                    "source": ['query.id'],
                    "validation": { "type": "string", "description": "Group id (use id or code)" }
                },
                "code": {
                    "source": ['query.code'],
                    "validation": { "type": "string", "description": "Group code (use id or code)" }
                }
            },

            '/admin/all': {
                "_apiInfo": {
                    "l": "Get all users and groups of the caller's tenant; sub-tenants get groups only",
                    "group": "Administration"
                },
                "scope": {
                    "source": ['query.scope'],
                    "validation": { "type": "string", "enum": ["myTenancy", "otherTenancy", "otherTenancyInvited"], "description": "myTenancy, otherTenancy or otherTenancyInvited; filters the users part" }
                }
            },
            '/admin/tokens': {
                "_apiInfo": {
                    "l": "List invite tokens (inviteToJoin or joinInvite), newest first, paginated",
                    "group": "Administration"
                },
                "commonFields": ["start", "limit"],
                "service": {
                    "source": ['query.service'],
                    "validation": { "type": "string", "enum": ["inviteToJoin", "joinInvite"], "description": "Token type to list: inviteToJoin (POST /invite) or joinInvite (join validation codes); required" }
                }
            }
        },

        "post": {
            '/user/last/seen': {
                "_apiInfo": {
                    "l": "Update user last seen timestamp & last network if provided",
                    "group": "Internal"
                },
                "lastNetwork": {
                    "source": ['body.network'],
                    "validation": { "type": "string", "description": "Network name to record as the user's last network" }
                },
            },
            '/email': {
                "_apiInfo": {
                    "l": "Send an email from a configured mail template to an address or a user id",
                    "group": "Custom email"
                },
                "email": {
                    "source": ['body.email'],
                    "validation": { "type": "string", "format": "email", "description": "Recipient address; takes precedence over id" }
                },
                "id": {
                    "source": ['body.id'],
                    "validation": { "type": "string", "description": "User id whose email is used as recipient when email is not given" }
                },
                "what": {
                    "source": ['body.what'],
                    "required": true,
                    "validation": { "type": "string", "description": "Name of the mail entry in urac mail config (provision or registry) to send" }
                },
                "data": {
                    "source": ['body.data'],
                    "validation": {
                        "type": "object",
                        "description": "Variables passed to the mail template"
                    }
                }
            },
            '/invite': {
                "_apiInfo": {
                    "l": "Invite a person to join: SMS a 6-digit invite code and email a join link",
                    "group": "User administration"
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "required": true,
                    "validation": { "type": "string", "description": "Invitee phone; the invite code is sent here by SMS" }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; sets the joining user's groups" }
                }
            },
            '/join/invite/phone': {
                "_apiInfo": {
                    "l": "Join with an invite code; active at once if phone matches the invite",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "minLength": 5,
                        "maxLength": 50,
                        "pattern": /^[a-zA-Z0-9_-]+$/,
                        "description": "Optional; defaults to the phone number"
                    }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "validation": { "type": "string", "format": "email" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; sets groups. Defaults to the invite's" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "required": true,
                    "validation": { "type": "string", "description": "Must match the invited phone to activate the account at once" }
                },
                "code": {
                    "source": ['body.code'],
                    "required": true,
                    "validation": { "type": "string", "description": "6-digit invite code from POST /invite" }
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "default": "phone",
                    "validation": { "type": "string", "enum": ["email", "emailAndPhone", "phone"], "description": "Validation channel if not auto-activated: email, phone or emailAndPhone" }
                }
            },
            '/join/invite': {
                "_apiInfo": {
                    "l": "Join with an invite code; active at once if email matches the invite",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "minLength": 5,
                        "maxLength": 50,
                        "pattern": /^[a-zA-Z0-9_-]+$/,
                        "description": "Optional; a random 20-character username is generated if omitted"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email", "description": "Must match the invited email to activate the account at once" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; sets groups. Defaults to the invite's" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                },
                "code": {
                    "source": ['body.code'],
                    "required": true,
                    "validation": { "type": "string", "description": "6-digit invite code from POST /invite" }
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "default": "email",
                    "validation": { "type": "string", "enum": ["email", "emailAndPhone", "phone"], "description": "Validation channel if not auto-activated: email, phone or emailAndPhone" }
                }
            },
            '/join': {
                "_apiInfo": {
                    "l": "Sign up a new account; emails a validation link unless validateJoin is off",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "minLength": 5,
                        "maxLength": 50,
                        "pattern": /^[a-zA-Z0-9_-]+$/,
                        "description": "Optional; a random 20-character username is generated if omitted"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; sets the user's groups" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                }
            },
            '/join/code': {
                "_apiInfo": {
                    "l": "Sign up a new account; validation sent as email code, link or SMS code",
                    "group": "Guest join"
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "minLength": 5,
                        "maxLength": 50,
                        "pattern": /^[a-zA-Z0-9_-]+$/,
                        "description": "Optional; a random 20-character username is generated if omitted"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; sets the user's groups" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string", "description": "Phone number; receives the SMS code when confirmation is phone or emailAndPhone" }
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "default": "email",
                    "validation": { "type": "string", "enum": ["email", "emailAndPhone", "phone"], "description": "email: email code or link (per config); phone: SMS code; emailAndPhone: link plus SMS code" }
                }
            },

            '/admin/user': {
                "_apiInfo": {
                    "l": "Add a user to the caller's tenant; email depends on status",
                    "group": "User administration"
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "minLength": 5,
                        "maxLength": 50,
                        "pattern": /^[a-zA-Z0-9_-]+$/,
                        "description": "Optional; a random 20-character username is generated if omitted"
                    }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "validation": { "type": "string", "format": "email" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Group codes to assign; overridden by membership"
                    }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; replaces groups with its groups" }
                },
                "status": {
                    "source": ['body.status'],
                    "default": "pendingNew",
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'inactive', 'pendingNew', 'pending'],
                        "description": "pendingNew: email set-password link; pending: no email; active or inactive: notice email"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "validation": { "type": "string", "description": "Optional; a random password is set if omitted" }
                },
                "passwordEncrypted": {
                    "source": ['body.passwordEncrypted'],
                    "validation": { "type": "boolean", "description": "True if password is already hashed; stored as is" }
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
                        "required": ["code", "allowed"],
                        "description": "{code: true generates a pin and emails it, allowed: pin login allowed}"
                    }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                }
            },
            '/admin/user/tenant': {
                "_apiInfo": {
                    "l": "Add a user to a given tenant; default status active (sends a notice email)",
                    "group": "User administration"
                },
                "id": {
                    "source": ['body.id'],
                    "validation": {
                        "type": "string",
                        "pattern": `^[a-f\\d]{24}$`,
                        "description": "Optional 24-hex id to use as the new user's id"
                    }
                },
                "username": {
                    "source": ['body.username'],
                    "validation": {
                        "type": "string",
                        "description": "Optional; a random 20-character username is generated if omitted"
                    }
                },
                "firstName": {
                    "source": ['body.firstName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "validation": { "type": "string", "format": "email" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object stored on the user" }
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Group codes to assign; overridden by membership"
                    }
                },
                "membership": {
                    "source": ['body.membership'],
                    "validation": { "type": "string", "description": "Membership name from urac config; replaces groups with its groups" }
                },
                "tenant": {
                    "source": ['body.tenant'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} the user belongs to"
                    }
                },
                "status": {
                    "source": ['body.status'],
                    "default": "active",
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'inactive', 'pendingNew', 'pending'],
                        "description": "pendingNew: email set-password link; pending: no email; active or inactive: notice email"
                    }
                },
                "password": {
                    "source": ['body.password'],
                    "validation": { "type": "string", "description": "Optional; a random password is set if omitted" }
                },
                "passwordEncrypted": {
                    "source": ['body.passwordEncrypted'],
                    "validation": { "type": "boolean", "description": "True if password is already hashed; stored as is" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                }
            },
            '/admin/users/ids': {
                "_apiInfo": {
                    "l": "Get users by a list of ids; paginated",
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
                        },
                        "description": "User ids to fetch; invalid ids are skipped"
                    }
                },
                "config": {
                    "source": ['body.config'],
                    "validation": { "type": "boolean", "description": "Include config.allowedTenants in results (pin codes hidden)" }
                }
            },

            '/admin/group': {
                "_apiInfo": {
                    "l": "Add a group to the caller's tenant with packages and environments",
                    "group": "Group administration"
                },
                "code": {
                    "source": ['body.code'],
                    "required": true,
                    "validation": {
                        "type": "string",
                        "format": "alphanumeric",
                        "maxLength": 20,
                        "description": "Group code, alphanumeric, max 20 chars; referenced by users' groups"
                    }
                },
                "name": {
                    "source": ['body.name'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "description": {
                    "source": ['body.description'],
                    "required": true,
                    "validation": { "type": "string" }
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
                        },
                        "description": "Allowed packages: list of {product, packages: [package codes]}"
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
                        },
                        "description": "Allowed environment codes (letters only, stored uppercase)"
                    }
                },
                "locked": {
                    "source": ['body.locked'],
                    "validation": { "type": "boolean", "description": "Locked groups cannot be deleted with DELETE /admin/group" }
                },
            },
            '/admin/group/tenant': {
                "_apiInfo": {
                    "l": "Add a group to a given tenant with packages and environments",
                    "group": "Group administration"
                },
                "code": {
                    "source": ['body.code'],
                    "required": true,
                    "validation": {
                        "type": "string",
                        "format": "alphanumeric",
                        "maxLength": 20,
                        "description": "Group code, alphanumeric, max 20 chars; referenced by users' groups"
                    }
                },
                "name": {
                    "source": ['body.name'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "description": {
                    "source": ['body.description'],
                    "required": true,
                    "validation": { "type": "string" }
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
                        },
                        "description": "Allowed packages: list of {product, packages: [package codes]}"
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
                        },
                        "description": "Allowed environment codes (letters only, stored uppercase)"
                    }
                },
                "locked": {
                    "source": ['body.locked'],
                    "validation": { "type": "boolean", "description": "Locked groups cannot be deleted with DELETE /admin/group" }
                },
                "tenant": {
                    "source": ['body.tenant'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} that owns the group"
                    }
                },
            },
            '/admin/groups': {
                "_apiInfo": {
                    "l": "Add multiple groups to a tenant (no environments)",
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
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} that owns the groups; defaults to caller tenant"
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
                                    "type": "string"
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
                                },
                                "locked": {
                                    "type": "boolean"
                                }
                            },
                            "requires": ["code", "name", "description", "packages"]
                        },
                        "description": "Groups to add: {code, name, description, packages, locked}; environments not supported"
                    }
                }
            }
        },

        "delete": {
            '/admin/group': {
                "_apiInfo": {
                    "l": "Delete a group by id (not locked) and remove its code from users",
                    "group": "Group administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "Group id" }
                }
            },
            '/admin/groups/tenant': {
                "_apiInfo": {
                    "l": "Delete groups by ids for a tenant; no users clean-up",
                    "group": "Group administration"
                },
                "tenant": {
                    "source": ['query.tenant'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            }
                        },
                        "required": ["id"],
                        "description": "Tenant {id} whose groups are deleted"
                    }
                },
                "ids": {
                    "source": ['body.ids'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Group ids to delete"
                    }
                },
            },
            '/admin/user': {
                "_apiInfo": {
                    "l": "Permanently delete a user by id (not locked); returns the deleted record",
                    "group": "User administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "User id" }
                }
            }
        },

        "put": {
            '/password/reset': {
                "_apiInfo": {
                    "l": "Set a new password with a reset or add-user token or code; activates user",
                    "group": "My account guest"
                },
                "token": {
                    "source": ['body.token'],
                    "required": true,
                    "validation": { "type": "string", "description": "Token from the reset or add-user email link, or the 6-digit reset code" }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "required": true,
                    "validation": { "type": "string", "description": "Must equal password" }
                }
            },

            '/account/password': {
                "_apiInfo": {
                    "l": "Change the signed-in user's password; requires the old password",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": false,
                    "validation": { "type": "string", "description": "Optional; if sent, must be the signed-in user's id" }
                },
                "oldPassword": {
                    "source": ['body.oldPassword'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "confirmation": {
                    "source": ['body.confirmation'],
                    "required": true,
                    "validation": { "type": "string", "description": "Must equal password" }
                }
            },

            '/account/email': {
                "_apiInfo": {
                    "l": "Request an email change for the signed-in user; emails a confirmation link",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": false,
                    "validation": { "type": "string", "description": "Optional; if sent, must be the signed-in user's id" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email", "description": "New email; a confirmation link is sent to it" }
                }
            },

            '/account/phone': {
                "_apiInfo": {
                    "l": "Request a phone change for the signed-in user; sends a 6-digit SMS code",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": false,
                    "validation": { "type": "string", "description": "Optional; if sent, must be the signed-in user's id" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "required": true,
                    "validation": { "type": "string", "description": "New phone; a 6-digit code is sent to it by SMS" }
                }
            },

            '/account/email/code': {
                "_apiInfo": {
                    "l": "Request an email change for the signed-in user; emails a 6-digit code",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": false,
                    "validation": { "type": "string", "description": "Optional; if sent, must be the signed-in user's id" }
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": { "type": "string", "format": "email", "description": "New email; a 6-digit code is sent to it" }
                }
            },

            '/account': {
                "_apiInfo": {
                    "l": "Edit the signed-in user's name, username, profile, language or phone",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": false,
                    "validation": { "type": "string", "description": "Optional; if sent, must be the signed-in user's id" }
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
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": { "type": "string" }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object; replaces the stored profile" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                }
            },
            '/admin/account/password': {
                "_apiInfo": {
                    "l": "Set an active user's password by id without the old password",
                    "group": "My account"
                },
                "id": {
                    "source": ['body.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "User id (must be active)" }
                },
                "password": {
                    "source": ['body.password'],
                    "required": true,
                    "validation": { "type": "string" }
                }
            },
            '/admin/user': {
                "_apiInfo": {
                    "l": "Edit a user by id: names, username, email, groups, status, profile, ln, phone",
                    "group": "User administration"
                },
                "id": {
                    "source": ['body.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "User id" }
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
                    "validation": { "type": "string" }
                },
                "lastName": {
                    "source": ['body.lastName'],
                    "validation": { "type": "string" }
                },
                "email": {
                    "source": ['body.email'],
                    "validation": { "type": "string", 'format': 'email' }
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Group codes; replaces the user's groups in their own tenant"
                    }
                },
                "status": {
                    "source": ['body.status'],
                    "validation": {
                        "type": "string",
                        "enum": ['active', 'inactive', 'pendingNew', 'pendingJoin'],
                        "description": "New user status"
                    }
                },
                "profile": {
                    "source": ['body.profile'],
                    "validation": { "type": "object", "description": "Free-form profile object; replaces the stored profile" }
                },
                "ln": {
                    "source": ['body.ln'],
                    "validation": { "type": "string", "description": "Language code; selects localized email/link config" }
                },
                "phone": {
                    "source": ['body.phone'],
                    "validation": { "type": "string" }
                }
            },
            '/admin/user/invited/groups': {
                "_apiInfo": {
                    "l": "Replace a user's groups in an invited tenant; user by id, username or email",
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
                        },
                        "description": "Group codes; replaces the user's groups in that tenant"
                    }
                },
                "tenantId": {
                    "source": ['body.tenantId'],
                    "required": true,
                    "validation": { "type": "string", "description": "Id of the tenant the user was invited to" }
                }
            },
            '/admin/user/groups': {
                "_apiInfo": {
                    "l": "Replace a user's groups in the caller's tenant; user by id, username or email",
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
                        },
                        "description": "Group codes; replaces the user's groups in the caller's tenant"
                    }
                }
            },
            '/admin/user/pin': {
                "_apiInfo": {
                    "l": "Delete, reset (emails new pin) or allow/deny a user's pin in the caller's tenant",
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
                        },
                        "description": "{delete: true} removes the pin; {reset: true} emails a new pin; allowed toggles pin login"
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
                    "validation": { "type": "string", "description": "User id" }
                },
                "status": {
                    "source": ['body.status'],
                    "required": true,
                    "validation": { "type": "string", "enum": ['active', 'inactive', 'pendingNew', 'pending'], "description": "New user status" }
                }
            },

            '/admin/group': {
                "_apiInfo": {
                    "l": "Edit a group by id; adds or overwrites given envs and packages, removes none",
                    "group": "Group administration"
                },
                "id": {
                    "source": ['body.id'],
                    "required": true,
                    "validation": { "type": "string", "description": "Group id" }
                },
                "name": {
                    "source": ['body.name'],
                    "required": true,
                    "validation": { "type": "string" }
                },
                "description": {
                    "source": ['body.description'],
                    "validation": { "type": "string" }
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
                        },
                        "description": "Products to set: list of {product, packages}; other products kept"
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
                        },
                        "description": "Environment codes to add (stored uppercase); existing ones kept"
                    }
                }
            },

            '/admin/groups/environments': {
                "_apiInfo": {
                    "l": "Add environments to groups by ids or codes; existing ones are kept",
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
                        },
                        "description": "Environment codes to add (stored uppercase); existing ones kept"
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
                        },
                        "description": "Target groups: {ids: [...]} or {codes: [...]}; codes win if both"
                    }
                }
            },

            '/admin/groups/packages': {
                "_apiInfo": {
                    "l": "Set packages per product on groups by ids or codes; other products kept",
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
                        },
                        "description": "Products to set: list of {product, packages}; other products kept"
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
                        },
                        "description": "Target groups: {ids: [...]} or {codes: [...]}; codes win if both"
                    }
                }
            },


            '/admin/user/self/invite': {
                "_apiInfo": {
                    "l": "Add the logged-in user to another tenant with optional groups and pin",
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
                        "required": ["code", "allowed"],
                        "description": "{code: true generates a pin and emails it, allowed: pin login allowed}"
                    }
                },
                "groups": {
                    "source": ['body.groups'],
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Group codes to assign in the target tenant"
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
                        "required": ["code", "id"],
                        "description": "Tenant {id, code} to add the logged-in user to"
                    }
                }
            },

            '/admin/users/invite': {
                "_apiInfo": {
                    "l": "Invite existing users (id, username or email) to the caller's tenant; max 100",
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
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                },
                                "membership": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": "Up to 100 of {user: {id, username or email}, groups, membership, pin}; groups win over membership"
                    }
                }
            },
            '/admin/users/invite/tenant': {
                "_apiInfo": {
                    "l": "Invite existing users (id, username or email) to a given tenant; max 100",
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
                            "required": ["user"],
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
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                },
                                "membership": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": "Up to 100 of {user: {id, username or email}, groups, membership, pin}; groups win over membership"
                    }
                },
                "tenant": {
                    "source": ['body.tenant'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} to invite the users to"
                    }
                }
            },

            '/admin/users/uninvite': {
                "_apiInfo": {
                    "l": "Remove users (id, username or email) from the caller's tenant; max 100",
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
                            "required": ["user"],
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
                        },
                        "description": "Up to 100 of {user: {id, username or email}} to remove from the caller's tenant"
                    }
                }
            },
            '/admin/users/uninvite/tenant': {
                "_apiInfo": {
                    "l": "Remove users (id, username or email) from a given tenant; max 100",
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
                            "required": ["user"],
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
                        },
                        "description": "Up to 100 of {user: {id, username or email}} to remove from the tenant"
                    }
                },
                "tenant": {
                    "source": ['body.tenant'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": 'string'
                            },
                            "code": {
                                "type": 'string'
                            }
                        },
                        "required": ["id", "code"],
                        "description": "Tenant {id, code} to remove the users from"
                    }
                }
            }
        }
    }
};
