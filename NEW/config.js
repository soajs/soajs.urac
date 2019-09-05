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
        415: "Unable to find group.",
        601: "Model not found"
    },

    "schema": {
        "commonFields": {},
        "get": {

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