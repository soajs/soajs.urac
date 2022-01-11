"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');


describe("Unit test for: BL - addUser main tenant", () => {
    let soajs = {
        "registry": {
            "custom": {
                "mail": {
                    "value": {
                        "from": "soajs@cloud.rockspoon.io",
                        "transport": {
                            "type": "smtp",
                            "options": {
                                "host": "smtp.mailgun.org",
                                "port": 465,
                                "auth": {
                                    "user": "soajs@cloud.rockspoon.io",
                                    "pass": "xxxxxxxxx"
                                }
                            }
                        }
                    }
                },
                "urac": {
                    "value": {
                        "hashIterations": 12,
                        "link": {
                            "addUser": "https://dev-site.rockspoon.io/#/setNewPassword",
                            "changeEmail": "https://dev-site.rockspoon.io/#/changeEmail/validate",
                            "forgotPassword": "https://dev-site.rockspoon.io/#/resetPassword",
                            "join": "https://dev-site.rockspoon.io/#/join/validate"
                        },
                        "tokenExpiryTTL": 172800000,
                        "validateJoin": true,
                        "mail": {
                            "addUser": {
                                "subject": "Account Created at SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
                            },
                            "changeEmail": {
                                "subject": "Change Account Email at SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
                            },
                            "changeUPin": {
                                "subject": "Change Pin",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changePin.tmpl"
                            },
                            "changeUserStatus": {
                                "subject": "Account Status changed at SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
                            },
                            "forgotPassword": {
                                "subject": "Reset Your Password at SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
                            },
                            "invitePin": {
                                "subject": "Pin Code Created at SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/invitePin.tmpl"
                            },
                            "join": {
                                "subject": "Welcome to SOAJS",
                                "path": "/opt/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
                            }
                        }
                    }
                }
            }
        },
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "servicesConfig": {},
        "log": {
            "error": (msg) => {
                console.log(msg);
            },
            "debug": (msg) => {
                console.log(msg);
            },
            "info": (msg) => {
                console.log(msg);
            }
        }
    };

    before((done) => {

        let localConfig = helper.requireModule("config.js");
        BL.init(soajs, localConfig, () => {
            done();
        });
    });

    it("Add user", function (done) {
        function MODEL_USER() {
            console.log("user model");
        }

        MODEL_USER.prototype.closeConnection = () => {
        };
        MODEL_USER.prototype.checkUsername = (data, cb) => {
            if (data && data.username && data.username === "found") {
                return cb(null, 1);
            } else if (data && data.username && data.username === "error") {
                let error = new Error("User: checkUsername - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, null);
            }
        };
        MODEL_USER.prototype.add = (data, cb) => {
            if (data && data.firstName && data.firstName === "error") {
                let error = new Error("User: add - mongo error.");
                return cb(error, null);
            } else {
                data._id = "5cfb05c22ac09278709d0141";
                assert.ok(data.tenant.pin.code);
                return cb(null, data);
            }
        };
        BL.user.model = MODEL_USER;

        function MODEL_TOKEN() {
            console.log("user model");
        }

        MODEL_TOKEN.prototype.closeConnection = () => {
        };
        MODEL_TOKEN.prototype.add = (data, cb) => {
            let token = {
                "token": "12673218763782168721"
            };
            return cb(null, token);
        };
        BL.token.model = MODEL_TOKEN;


        let data = {
            "username": "found"
        };
        BL.addUser(soajs, data, null, (error) => {
            assert.ok(error);
            let data = {
                "username": "error"
            };
            BL.addUser(soajs, data, null, (error) => {
                assert.ok(error);

                let data = {
                    "username": "testBL",
                    "firstName": "error",
                    "lastName": "testBL",
                    "email": "testBL@soajs.org",

                    "password": "password",
                    "status": "pendingNew",
                    "profile": {"antoine": "hage"},
                    "groups": ["devop"],
                    "pin": {
                        "allowed": true,
                        "code": true
                    }
                };
                BL.addUser(soajs, data, null, (error) => {
                    assert.ok(error);

                    let data = {
                        "username": "testBL",
                        "firstName": "unitBL",
                        "lastName": "testBL",
                        "email": "testBL@soajs.org",

                        "password": "password",
                        "status": "pendingNew",
                        "profile": {"antoine": "hage"},
                        "groups": ["devop"],
                        "pin": {
                            "allowed": true,
                            "code": true
                        }
                    };
                    BL.addUser(soajs, data, null, (error, record) => {
                        assert.ifError(error);
                        assert.ok(record);
                        assert.deepEqual(record, {
                                id: '5cfb05c22ac09278709d0141'
                            }
                        );
                        done();
                    });
                });
            });
        });
    });
});
