'use strict';
let prod = {
    _id: "5512867be603d7e01ab1688d",
    locked: true,
    code: "DSBRD",
    name: "Console UI Product",
    console: true,
    description: "This is the main Console UI Product.",
    scope: {
        acl: {
            dashboard: {
                urac: {
                    "3": {
                        access: true,
                        apisPermission: "restricted",
                        get: [
                            {
                                group: "Group administration",
                                apis: {
                                    "/admin/groups": {
                                        access: true
                                    },
                                    "/admin/group": {
                                        access: true
                                    }
                                }
                            },
                            {
                                group: "User administration",
                                apis: {
                                    "/admin/user": {
                                        access: true
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    },
    packages: [
        {
            code: "DSBRD_GUEST",
            name: "Guest",
            locked: true,
            description: "This package is used to provide anyone access to login and forgot password. Once logged in the package linked to the user tenant will take over thus providing the right access to the logged in user.",
            acl: {
                dashboard: {

                    urac: [
                        {
                            version: "3",
                            post: [
                                "My account guest"
                            ],
                            get: [
                                "My account guest"
                            ]
                        }
                    ]
                }
            },
            _TTL: 604800000
        },
        {
            code: "DSBRD_OWNER",
            name: "Owner",
            description: "This package is used to provide owner level access. This means the user who has this package will have access to everything.",
            locked: true,
            acl: {
                dashboard: {
                    urac: [
                        {
                            version: "3",
                            get: [
                                "Group administration",
                                "User administration",
                                "My account"
                             ]
                        }
                    ]
                }
            },
            _TTL: 604800000
        },
        {
            code: "DSBRD_DEVOP",
            name: "DevOps",
            locked: true,
            description: "This package has the right privileges a DevOps user will need to be able to configure, control, and monitor what is happening across the board.",
            acl: {
                dashboard: {
                    urac: [
                        {
                            version: "3",
                            get: [
                                "My account"
                            ]
                        }
                    ]
                }
            },
            _TTL: 604800000
        }
    ]
};

module.exports = prod;