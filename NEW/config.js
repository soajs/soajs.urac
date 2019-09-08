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

    "errors": {
        400: "Business logic required data are missing.",
        420: "Unable to find group.",

        520: "Unable to find user.",

        601: "Model not found",
        602: "Model error: ",
    },

    "schema": {
        "commonFields": {},
        "get": {

            '/forgotPassword': {
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

            '/admin/user': {
                "_apiInfo": {
                    "l": "Get user record by id",
                    "group": "Administration"
                },
                "uId": {
                    "source": ['query.uId'],
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
                "tId": {
                    "source": ['query.tId'],
                    "required": false,
                    "validation": {"type": "string"}
                },
                "config": {
                    "source": ['query.config'],
                    "required": false,
                    "validation": {"type": "boolean"}
                }
            },

            '/admin/groups': {
                "_apiInfo": {
                    "l": "List groups",
                    "group": "Administration"
                },
                "tId": {
                    "source": ['query.tId'],
                    "required": false,
                    "validation": {"type": "string"}
                }
            },
            '/admin/group': {
                "_apiInfo": {
                    "l": "Get group record by _id",
                    "group": "Administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            }

        },

        "post": {
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
                "config": {
                    "source": ['body.config'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "allowedPackages": {
                                "validation": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^([A-Za-z0-9]+)$": { //pattern to match an api route
                                            "type": "array",
                                            "required": true,
                                            "items": {
                                                "type": "string"
                                            }
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "allowedEnvironments": {
                                "validation": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^([A-Za-z]+)$": {
                                            "type": "object",
                                            "validation": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        }
                    }
                }
            },
            '/admin/groups/environments': {
                "_apiInfo": {
                    "l": "Add environment(s) to group(s)",
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
                    "l": "Add package(s) to group(s)",
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
        },
        "delete": {
            '/admin/group': {
                "_apiInfo": {
                    "l": "Delete Group",
                    "group": "Administration"
                },
                "gId": {
                    "source": ['query.gId'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            }
        },
        "put": {
            '/admin/group': {
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
                },
                "config": {
                    "source": ['body.config'],
                    "required": true,
                    "validation": {
                        "type": "object",
                        "properties": {
                            "allowedPackages": {
                                "validation": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^([A-Za-z0-9]+)$": { //pattern to match an api route
                                            "type": "array",
                                            "required": true,
                                            "items": {
                                                "type": "string"
                                            }
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "allowedEnvironments": {
                                "validation": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^([A-Za-z]+)$": {
                                            "type": "object",
                                            "validation": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};