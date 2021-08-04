'use strict';

let token = {
    "record": {
        "_id": "610a9b773aabc5d43b1f6c0c",
        "email": "tony@hage.com",
        "phone": "9999999999",
        "firstName": "tony",
        "lastName": "hage",
        "token": "107810",
        "expires": new Date((new Date().getFullYear()) + 2, 0, 1),
        "status": "active",
        "ts": new Date().getTime(),
        "service": "inviteToJoin"
    },
    "tenant": {
        "code": 'DBTN'
    }
};

module.exports = token;

