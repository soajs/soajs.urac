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
        420: "Unable to find group.",

        520: "Unable to find user.",
        521: "User account already exists.",
        522: "The password and its confirmation do not match.",
        523: "The provided current password is not correct.",
        524: "Cannot join with a sub tenant key",
        525: "Unable to generate pin at this time.",
        526: "Email already exists.",

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
        "get": {


            '/password/forgot': {
                "_apiInfo": {
                    "l": "Forgot Password",
                    "group": "Guest Password Settings"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/validate/join': {
                "_apiInfo": {
                    "l": "Validate registered account",
                    "group": "Guest Join"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/checkUsername': {
                "_apiInfo": {
                    "l": "Check If Username Exists",
                    "group": "Guest Check Username"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/validate/changeEmail': {
                "_apiInfo": {
                    "l": "Validate change email address",
                    "group": "Guest Email Validation"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/user': {
                "_apiInfo": {
                    "l": "Get User Info by username",
                    "group": "My Account",
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
                    "l": "Get user record by id",
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
                    "l": "List users",
                    "group": "Administration",
                    "groupMain": true
                },
                "commonFields": ["start", "limit", "keywords"],
                "config": {
                    "source": ['query.config'],
                    "required": false,
                    "validation": {"type": "boolean"}
                }
            },
            '/admin/users/ids': {
                "_apiInfo": {
                    "l": "List users by Id",
                    "group": "Administration",
                    "groupMain": true
                },
                "commonFields": ["start", "limit"],
                "ids": {
                    "source": ['query.ids'],
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
                    "source": ['query.config'],
                    "required": false,
                    "validation": {"type": "boolean"}
                }
            },
            '/admin/users/count': {
                "_apiInfo": {
                    "l": "Total users count",
                    "group": "Administration"
                },
                "commonFields": ["keywords"]
            },

            '/admin/groups': {
                "_apiInfo": {
                    "l": "List groups",
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
                    "l": "Get all users & groups",
                    "group": "Administration"
                }
            }

        },

        "post": {

            '/join': {
                "_apiInfo": {
                    "l": "Register",
                    "group": "Guest Join"
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

            '/admin/user': {
                "_apiInfo": {
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
                                "type": 'string'
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

            '/admin/group': {
                "_apiInfo": {
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
                                "package": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    }
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
                }
            }
        },
        "delete": {
            '/admin/group': {
                "_apiInfo": {
                    "l": "Delete Group",
                    "group": "Administration"
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
                    "l": "Reset Password",
                    "group": "Guest Password Settings"
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

            '/account/password': {
                "_apiInfo": {
                    "l": "Change Password",
                    "group": "My Account"
                },
                "id": {
                    "source": ['query.id'],
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
                    "l": "Change Email",
                    "group": "My Account"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "email": {
                    "source": ['body.email'],
                    "required": true,
                    "validation": {"type": "string", format: "email"}
                }
            },

            '/account': {
                "_apiInfo": {
                    "l": "Edit basic user info and profile",
                    "group": "My Account"
                },
                "id": {
                    "source": ['query.id'],
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

            '/admin/user': {
                "_apiInfo": {
                    "l": "Edit User Record",
                    "group": "Administration"
                },
                "id": {
                    "source": ['query.id'],
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

            '/admin/user/status': {
                "_apiInfo": {
                    "l": "Change user status",
                    "group": "Administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": {"type": "string"}
                },
                "status": {
                    "source": ['query.status'],
                    "required": true,
                    "validation": {"type": "string", "enum": ['active', 'inactive']}
                }
            },

            '/admin/group': {
                "_apiInfo": {
                    "l": "Edit Group",
                    "group": "Administration"
                },
                "id": {
                    "source": ['query.id'],
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
                                "package": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    }
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
                }
            },

            '/admin/groups/environments': {
                "_apiInfo": {
                    "l": "Update environment(s) to group(s)",
                    "group": "Administration"
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
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "format": "alphanumeric",
                            "maxLength": 20
                        }
                    }
                }
            },
            '/admin/groups/packages': {
                "_apiInfo": {
                    "l": "Update package(s) to group(s)",
                    "group": "Administration"
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
                                "package": {
                                    "type": "string"
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
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "format": "alphanumeric",
                            "maxLength": 20
                        }
                    }
                }
            }
        }
    }
};