'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const async = require("async");
const fs = require("fs");

const sdk_oauth = require("../sdk/oauth.js");

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const lib = {
    "mail": null,
    "message": null,
    "pwd": require("../lib/pwd.js")
};

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["user", "group", "token", "template"];

let bl = {
    init: init,
    group: null,
    user: null,
    token: null,
    template: null,

    "sendCustomEmail": (soajs, inputmaskData, options, cb) => {

        let sendEmail = (data, what) => {
            lib.mail.send(soajs, what, data, null, function (error, mailRecord) {
                if (error) {
                    soajs.log.info(what + ': No Mail was sent: ' + error.message);
                }
                return cb(null, mailRecord);
            });
        };

        let what = inputmaskData.what;
        let data = {};
        if (inputmaskData.data) {
            data = inputmaskData.data;
        }
        if (inputmaskData.email) {
            data.email = inputmaskData.email;
            sendEmail(data, what);
        } else if (inputmaskData.id) {
            let d = {
                "id": inputmaskData.id,
                "ignoreStatus": true
            };
            bl.user.getUser(soajs, d, null, (error, record) => {
                if (error) {
                    soajs.log.info(what + ': No Mail was sent: ' + error.message);
                }
                data.email = record.email;
                sendEmail(data, what);
            });
        } else {
            soajs.log.info(what + ': No Mail was sent, unable to find the TO email address.');
        }
    },

    "deleteGroup": (soajs, inputmaskData, options, cb) => {
        bl.group.deleteGroup(soajs, inputmaskData, null, (error, record) => {
            if (error) {
                return cb(error, null);
            } else {
                //close response but continue to clean up deleted group from users
                cb(null, true);
                let data = {};
                if (record && record.tenant) {
                    data.tId = record.tenant.id;
                    data.groupCode = record.code;
                    bl.user.cleanDeletedGroup(soajs, data, options, (error) => {
                        if (error) {
                            soajs.log.error(error);
                        }
                    });
                }
            }
        });
    },

    "validateJoinCode": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs, options);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.service = 'joinInvite';
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            if (tokenRecord.confirmation !== "phone") {
                if (tokenRecord.inviteToken !== inputmaskData.token) {
                    bl.user.mt.closeModel(modelObj);
                    return cb(bl.user.handleError(soajs, 598, null));
                }
            } else {
                inputmaskData.token = tokenRecord.inviteToken;
            }
            bl.validateJoin(soajs, inputmaskData, options, (error, response) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                return cb(null, response);
            });
        });
    },
    "validateJoin": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        if (!options || !options.mongoCore) {
            if (!options) {
                options = {};
            }
            options.mongoCore = modelObj.mongoCore;
        }
        inputmaskData = inputmaskData || {};
        inputmaskData.services = ['join', 'join_code', 'joinInvite'];
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
            data.status = ['active', 'pendingJoin'];
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let response = {
                    "username": userRecord.username,
                    "email": userRecord.email,
                    "_id": userRecord._id
                };
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, () => {
                    // no need to do anything here.
                });
                if (userRecord.status === "active") {
                    return cb(null, response);
                }
                let userData = {};
                userData._id = userRecord._id;
                userData.what = 'status';
                userData.status = 'active';
                bl.user.updateOneField(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('autoLogin')) {
                        let data = {
                            "id": userRecord._id.toString()
                        };
                        sdk_oauth.auto_login(soajs, data, (error, autoLogin) => {
                            if (error) {
                                soajs.console.log(error);
                            }
                            response.autoLogin = autoLogin || null;
                            return cb(null, response);
                        });
                    } else {
                        return cb(null, response);
                    }
                });
            });
        });
    },

    "validateChangeEmail": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.services = ['changeEmail', 'changeEmail_code'];
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
            if (tokenRecord.userId !== soajs.urac._id) {
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 598, null));
            }
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, () => {
                    // no need to do anything here.
                });
                let userData = {};
                userData._id = userRecord._id;
                userData.what = 'email';
                userData.email = tokenRecord.email;
                bl.user.updateOneField(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },
    "validateChangePhone": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.services = ['changePhone'];
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
            if (tokenRecord.userId !== soajs.urac._id) {
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 598, null));
            }
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, () => {
                    // no need to do anything here.
                });
                let userData = {};
                userData._id = userRecord._id;
                userData.phone = tokenRecord.phone;
                bl.user.updateUsernamePhone(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },
    "resetPassword": (soajs, inputmaskData, options, cb) => {
        inputmaskData = inputmaskData || {};
        if (inputmaskData.password !== inputmaskData.confirmation) {
            return cb(bl.user.handleError(soajs, 522, null));
        }
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData.services = ['forgotPassword', 'addUser', 'forgotPassword_code'];
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
            data.ignoreStatus = true;
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, () => {
                    // no need to do anything here.
                });
                let userData = {};
                userData._id = userRecord._id;
                userData.password = inputmaskData.password;
                bl.user.resetPassword(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },

    "changeEmail": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;

        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.username = inputmaskData.email;
            data.exclude_id = userRecord._id;
            bl.user.countUser(soajs, data, options, (error, found) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                if (found) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(bl.user.handleError(soajs, 526, error), null);
                }
                let data = {};
                data.userId = userRecord._id.toString();
                data.username = userRecord.username;
                data.code = inputmaskData.code || false;
                data.service = inputmaskData.service || "changeEmail";
                data.email = inputmaskData.email;
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    userRecord.email = inputmaskData.email;
                    lib.mail.send(soajs, data.service, userRecord, tokenRecord, function (error) {
                        if (error) {
                            soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
                        }
                        return cb(null, {"id": userRecord._id.toString()});
                    });
                });
            });
        });
    },

    "changePhone": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;

        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.username = inputmaskData.phone;
            data.exclude_id = userRecord._id;
            bl.user.countUserPhone(soajs, data, options, (error, found) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                if (found) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(bl.user.handleError(soajs, 526, error), null);
                }
                let data = {};
                data.userId = userRecord._id.toString();
                data.username = userRecord.username;
                data.code = true;
                data.service = inputmaskData.service || "changePhone";
                data.phone = inputmaskData.phone;
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    lib.message.send(soajs, data.service, data, tokenRecord, function (error) {
                        if (error) {
                            soajs.log.info(data.service + ': No SMS was sent: ' + error.message);
                        }
                        return cb(null, {"id": userRecord._id.toString()});
                    });
                });
            });
        });
    },

    "changePassword": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        if (inputmaskData.password !== inputmaskData.confirmation) {
            return cb(bl.user.handleError(soajs, 522, null));
        }
        inputmaskData.keep = {
            "pwd": true
        };
        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let encryptionConfig = {};
            if (soajs.servicesConfig && soajs.servicesConfig.hashIterations) {
                encryptionConfig.hashIterations = soajs.servicesConfig.hashIterations;
            } else {
                let hashIterations = get(["registry", "custom", "urac", "value", "hashIterations"], soajs);
                if (hashIterations) {
                    encryptionConfig.hashIterations = hashIterations;
                }
            }
            if (soajs.servicesConfig && soajs.servicesConfig.optionalAlgorithm) {
                encryptionConfig.optionalAlgorithm = soajs.servicesConfig.optionalAlgorithm;
            } else {
                let optionalAlgorithm = get(["registry", "custom", "urac", "value", "optionalAlgorithm"], soajs);
                if (optionalAlgorithm) {
                    encryptionConfig.optionalAlgorithm = optionalAlgorithm;
                }
            }
            lib.pwd.compare(encryptionConfig, inputmaskData.oldPassword, userRecord.password, bl.user.localConfig, (error, response) => {
                if (error || !response) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(bl.user.handleError(soajs, 523, error), null);
                }
                let userData = {};
                userData._id = userRecord._id;
                userData.password = inputmaskData.password;
                bl.user.resetPassword(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },

    "forgotPassword": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData.status = ["active", "pendingNew", "pendingJoin"];
        bl.user.getUserByUsername(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            //No need to assure userRecord. At this point userRecord is valid and not empty
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.code = inputmaskData.code || false;
            data.service = inputmaskData.service || "forgotPassword";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                //close model
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                lib.mail.send(soajs, data.service, userRecord, tokenRecord, function (error) {
                    if (error) {
                        soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
                    }
                    return cb(null, true);
                });
            });
        });
    },

    "getUsersAndGroups": (soajs, inputmaskData, options, cb) => {
        if (soajs.tenant.type === "client" && soajs.tenant.main) {
            bl.group.getGroups(soajs, inputmaskData, null, (error, groupRecords) => {
                if (error) {
                    return cb(error, null);
                }
                return cb(null, {'users': [], 'groups': groupRecords});
            });
        } else {
            //TODO: better to make this async
            //As main tenant both users and groups share the same DB connection
            let modelObj = bl.user.mt.getModel(soajs);
            options = {};
            options.mongoCore = modelObj.mongoCore;
            bl.group.getGroups(soajs, inputmaskData, options, (error, groupRecords) => {
                if (error) {
                    return cb(error, null);
                }
                bl.user.getUsers(soajs, inputmaskData, options, (error, userRecords) => {
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, {'users': userRecords, 'groups': groupRecords});
                });
            });
        }
    },

    "editUser": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;

        inputmaskData = inputmaskData || {};
        //NOTE: we must ignore status in edit user, because we want to get the user no matter what is the status
        inputmaskData.ignoreStatus = true;
        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            inputmaskData._id = userRecord._id;

            let doEdit = () => {
                bl.user.edit(soajs, inputmaskData, options, (error, result) => {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, !!result);
                });
            };
            if (inputmaskData.email) {
                let data = {};
                data.username = inputmaskData.email;
                data.exclude_id = userRecord._id;
                bl.user.countUser(soajs, data, options, (error, found) => {
                    if (error) {
                        //close model
                        bl.user.mt.closeModel(modelObj);
                        return cb(error, null);
                    }
                    if (found) {
                        //close model
                        bl.user.mt.closeModel(modelObj);
                        return cb(bl.user.handleError(soajs, 526, error), null);
                    }
                    doEdit();
                });
            } else {
                doEdit();
            }
        });
    }
};

function init(service, localConfig, cb) {

    let fillModels = (blName, cb) => {
        let typeModel = __dirname + `/../model/${model}/${blName}.js`;

        if (fs.existsSync(typeModel)) {
            SSOT[`${blName}Model`] = require(typeModel);
        }
        if (SSOT[`${blName}Model`]) {
            let temp = require(`./${blName}.js`);
            temp.model = SSOT[`${blName}Model`];
            temp.localConfig = localConfig;
            bl[blName] = temp;
            return cb(null);
        } else {
            return cb({name: blName, model: typeModel});
        }
    };
    async.each(BLs, fillModels, function (err) {

        bl.addUser = require("./lib/addUser.js")(bl);
        bl.join = require("./lib/join.js")(bl);
        bl.selfInvite = require("./lib/selfInvite.js")(bl);
        bl.inviteUsers = require("./lib/inviteUsers.js")(bl);
        bl.uninviteUsers = require("./lib/uninviteUsers.js")(bl);
        bl.editPin = require("./lib/editPin.js")(bl);
        bl.emailToken = require("./lib/emailToken.js")(bl);
        bl.resendCode = require("./lib/resendCode.js")(bl);
        bl.inviteToJoin = require("./lib/inviteToJoin.js")(bl);
        bl.joinInvite = require("./lib/joinInvite.js")(bl);
        bl.joinInvitePhone = require("./lib/joinInvitePhone.js")(bl);
        bl.joinCode = require("./lib/joinCode.js")(bl);

        lib.mail = require("../lib/mail.js")(bl);
        lib.message = require("../lib/message.js");

        if (err) {
            service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
            return cb({"code": 601, "msg": localConfig.errors[601]});
        }
        return cb(null);
    });
}

module.exports = bl;
