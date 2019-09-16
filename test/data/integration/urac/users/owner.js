'use strict';

let user = {
    _id: "5c8d0c505653de3985aa0ffd",
    locked: true,
    username: "owner",
    password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
    firstName: "owner3",
    lastName: "owner",
    email: "me@localhost.com",
    ts: 1552747600152,
    status: "active",
    profile: {},
    groups: [
        "owner"
    ],
    config: {
        packages: {},
        keys: {},
        allowedTenants: [
            {
                tenant: {
                    id: "THYME_tID",
                    code: "THYME_CODE",
                    pin: {
                        code: "5678",
                        allowed: true
                    }
                },
                groups: [
                    "waiter"
                ]
            },
            {
                tenant: {
                    id: "ELVIRA_tID",
                    code: "ELVIRA_CODE"
                },
                groups: [
                    "manager"
                ]
            }
        ]
    },
    tenant: {
        id: "5c0e74ba9acc3c5a84a51259",
        code: "DBTN",
        pin: {
            code: "1235",
            allowed: true
        }
    },
    lastLogin: 1567004442409
};

module.exports = user;