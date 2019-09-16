'use strict';
let user = {
    _id: "5d7fee0876186d9ab9b36492",
    locked: true,
    username: "tony",
    password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
    firstName: "tony",
    lastName: "hage",
    email: "tony@localhost.com",
    ts: 1552747600152,
    status: "active",
    profile: {},
    groups: [
        "owner"
    ],
    config: {
        allowedTenants: [
            {
                tenant: {
                    id: "5c0e74ba9acc3c5a84a51251",
                    code: "TES1",
                    pin: {
                        code: "5678",
                        allowed: true
                    }
                },
                groups: [
                    "sub"
                ]
            },
            {
                tenant: {
                    id: "THYME_tID",
                    code: "THYME_CODE",
                    pin: {
                        code: "5677",
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
        code: "TES0",
        pin: {
            code: "1235",
            allowed: true
        }
    }
};

module.exports = user;