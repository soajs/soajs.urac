'use strict';

let lib = {
    "code" : "CPROD",
    "name" : "Test Product",
    "description" : "This is a product with multiple services and versions, version is sanitized",
    "console": false,
    "scope": {
        "acl": {
            "dashboard": {
                "urac": {
                    "3": {
                        "access": true,
                        "get": [
                            {
                                "apis": {

                                },
                                "group": "User Administration"
                            }
                        ]
                    }
                }
            }
        }
    },
    "packages" : [
        {
            "code" : "CPROD_EXA3",
            "name" : "example03 package",
            "description" : "this is a description for test product example03 package",
            "acl" : {
                "dashboard": {
                    "urac": [
                        {
                            "version": "3",
                            "get": [
                                "User Administration",
                            ],
                            "put": [
                                "User Administration",
                            ],
                            "delete": [
                                "User Administration",
                            ],
                            "post": [
                                "User Administration",
                            ]
                        }
                    ]
                }
            },
            "_TTL" : 86400000 // 24 hours
        }
    ]
};

module.exports = lib;