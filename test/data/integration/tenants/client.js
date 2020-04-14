'use strict';

let lib = {
    "_id": "5d9321f8b40e09438afbd0e3",
    "type": "client",
    "oauth": {
        secret: "this is a secret",
        redirectURI: "http://domain.com",
        grants: [
            "password",
            "refresh_token"
        ],
        disabled: 0,
        type: 2.0,
        loginMode: "urac",
        pin: {
            DSBRD: {
                enabled: false
            }
        },
    },
    "code": "client",
    "name": "Test Tenant",
    "description": "this is a description for test tenant",
    "applications": [
        {
            "product": "CPROD",
            "package": "CPROD_EXA3",
            "appId": "30d2cb5fc04ce51e06000003",
            "description": "this is a description for app for test tenant for test product and example03 package",
            "_TTL": 86400000, // 24 hours
            "keys": [
                {
                    "key": "ff7b65bb252201121f1be95adc08f44a",
                    "extKeys": [
                        {
                            "expDate": new Date().getTime() + 86400000,
                            "extKey": "aa39b5490c4a4ed0e56d7ec1232a428f1c5b5dcabc0788ce563402e233386738fc3eb18234a486ce1667cf70bd0e8b08890a86126cf1aa8d38f84606d8a6346359a61678428343e01319e0b784bc7e2ca267bbaafccffcb6174206e8c83f2a25",
                            "device": {},
                            "geo": {}
                        }
                    ],
                    "config": {
                        "dev": {
                            "commonFields": {},
                            "oauth": {
                                "loginMode": 'urac'
                            },
                            "urac": {
                                "hashIterations": 12, //used by hasher
                                "tokenExpiryTTL": 2 * 24 * 3600 * 1000
                            }
                        }
                    }
                }
            ]
        }
    ],
    "console": false
};

module.exports = lib;
