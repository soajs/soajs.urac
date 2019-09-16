'use strict';
let lib = {
    _id: "5c0e74ba9acc3c5a84a51259",
    type: "product",
    code: "DBTN",
    profile: {
        fabio: "cuba"
    },
    locked: true,
    name: "Console Tenant",
    description: "This is the tenant that holds the access rights and configuration for the console users with DSBRD_GUEST as Guest default package",
    oauth: {
        secret: "this is a secret",
        pin: {
            DSBRD: {
                enabled: false
            }
        },
        disabled: 0,
        type: 2,
        loginMode: "urac"
    },
    applications: [
        {
            product: "DSBRD",
            package: "DSBRD_GUEST",
            appId: "5c0e74ba9acc3c5a84a5125a",
            description: "Dashboard application for DSBRD_GUEST package",
            _TTL: 604800000,
            keys: [
                {
                    key: "a139786a6e6d18e48b4987e83789430b",
                    extKeys: [
                        {
                            extKey: "3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9",
                            device: null,
                            geo: null,
                            env: "DASHBOARD",
                            expDate: null,
                            dashboardAccess: true
                        },
                        {
                            extKey: "a6843d9da8e73271b68d046f2d11f65eab7022e6fc88a691005d7b685e613605aea35637c1e77016bf3f342019eeb24795f3c4195e0c6cba36731d0be27d1ae64d6e776deed5427908672cf1a7d58a343fe4b0d3ce9b374e17e108bff3daf274",
                            device: null,
                            geo: null,
                            env: "DEV",
                            expDate: null,
                            dashboardAccess: true
                        }
                    ],
                    config: {
                        dashboard: {
                            commonFields: {
                                mail: {
                                    from: "me@localhost.com",
                                    transport: {
                                        type: "sendmail",
                                        options: {

                                        }
                                    }
                                }
                            },
                            urac: {
                                passportLogin: {
                                    azure: {
                                        identityMetadata: "https://login.microsoftonline.com/07f5f2cb-e225-4fe2-b0dc-d1c0412956d3/v2.0/.well-known/openid-configuration",
                                        clientID: "a3fca555-4bf8-4caa-a8d3-ba6388e390fc",
                                        passReqToCallback: false,
                                        scope: [
                                            "User.Read"
                                        ]
                                    }
                                },
                                hashIterations: 1024,
                                seedLength: 32,
                                link: {
                                    addUser: "http://dashboard.soajs.org:80/#/setNewPassword",
                                    changeEmail: "http://dashboard.soajs.org:80/#/changeEmail/validate",
                                    forgotPassword: "http://dashboard.soajs.org:80/#/resetPassword",
                                    join: "http://dashboard.soajs.org:80/#/join/validate"
                                },
                                tokenExpiryTTL: 172800000,
                                validateJoin: true,
                                mail: {
                                    join: {
                                        subject: "Welcome to SOAJS",
                                        path: "undefined/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
                                    },
                                    forgotPassword: {
                                        subject: "Reset Your Password at SOAJS",
                                        path: "undefined/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
                                    },
                                    addUser: {
                                        subject: "Account Created at SOAJS",
                                        path: "undefined/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
                                    },
                                    changeUserStatus: {
                                        subject: "Account Status changed at SOAJS",
                                        path: "undefined/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
                                    },
                                    changeEmail: {
                                        subject: "Change Account Email at SOAJS",
                                        path: "undefined/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
                                    }
                                }
                            },
                            oauth: {
                                loginMode: "urac"
                            }
                        }
                    }
                }
            ]
        }
    ],
    tag: "Console",
    console: true
};

module.exports = lib;
