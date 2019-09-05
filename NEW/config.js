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
        400: "Business logic needed data are missing.",
        420: "Unable to find group.",

        500: "Unable to find user.",

        601: "Model not found"
    },

    "schema": {
        "commonFields": {},
        "get": {
            '/admin/getUser': {
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
            }

        },

        "post": {},
        "delete": {},
        "put": {}
    }
};