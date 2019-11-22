'use strict';
let user = {
    _id: "5c8d0c505653de3985aa0ffd",
    locked: true,
    username: "johnd",
    password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
    firstName: "John",
    lastName: "Doe",
    email: "john@localhost.com",
    ts: 1552747600152.0,
    status: "active",
    profile: {

    },
    groups: [
        "AAAA"
    ],
    config: {
        packages: {

        },
        keys: {

        },
        allowedTenants: [
            {
                tenant: {
                    "code": "TES2",
                    "id": "5c8d0c4f5653de3985aa0ff2",
                    pin: {
                        code: "9814",
                        allowed: true
                    }
                },
                groups: [
                    "AAAA"
                ]
            }
        ]
    },
    tenant: {
        id: "5c0e74ba9acc3c5a84a51259",
        code: "TES0",
        pin: {
            code: "1245",
            allowed: true
        }
    },
};

module.exports = user;