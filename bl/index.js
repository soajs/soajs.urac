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

const lib = {
    "mail": require("../lib/mail.js"),
    "pwd": require("../lib/pwd.js")
};

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["user", "group", "token"];

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

        bl["addUser"] = require("./lib/addUser.js")(bl);
        bl["join"] = require("./lib/join.js")(bl);
        bl["inviteUser"] = require("./lib/inviteUser.js")(bl);
        bl["inviteUsers"] = require("./lib/inviteUsers.js")(bl);
        bl["uninviteUsers"] = require("./lib/uninviteUsers.js")(bl);
        bl["editPin"] = require("./lib/editPin.js")(bl);

        if (err) {
            service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
            return cb({"code": 601, "msg": localConfig.errors[601]});
        }
        return cb(null);
    });
}

let bl = {
    init: init,
    group: null,
    user: null,
    token: null,

    "deleteGroup": (soajs, inputmaskData, options, cb) => {
        bl.group.deleteGroup(soajs, inputmaskData, null, (error, record) => {
            if (error) {
                return cb(error, null);
            }
            else {
                //close response but continue to clean up deleted group from users
                cb(null, true);
                let data = {};
                if (record && record.tenant) {
                    data.tId = record.tenant.id;
                    data.groupCode = record.code;
                    bl.user.cleanDeletedGroup(soajs, data, (error) => {
                        if (error) {
                            soajs.log.error(error);
                        }
                    });
                }
            }
        });
    },

    "validateJoin": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.service = 'join';
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
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
                bl.token.updateStatus(soajs, tokenData, options, (error, tokenRecord) => {
                    // no need to do anything here.
                });
                if (userRecord.status === "active") {
                    return cb(null, true);
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
                    return cb(null, true);
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
        inputmaskData.service = 'changeEmail';
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
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

    "resetPassword": (soajs, inputmaskData, options, cb) => {
        inputmaskData = inputmaskData || {};
        if (inputmaskData['password'] !== inputmaskData['confirmation']) {
            return cb(bl.user.handleError(soajs, 522, null));
        }
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData.services = ['forgotPassword', 'addUser'];
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.id = tokenRecord.userId;
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
                data.id = userRecord._id.toString();
                data.username = userRecord.username;
                data.service = "changeEmail";
                data.email = inputmaskData.email;
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    userRecord.email = inputmaskData.email;
                    lib.mail.send(soajs, "changeEmail", userRecord, tokenRecord, function (error, mailRecord) {
                        if (error) {
                            soajs.log.info('changeEmail: No Mail was sent: ' + error);
                        }
                        return cb(null, {
                            token: tokenRecord.token,
                            link: mailRecord.link || null
                        });
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
        inputmaskData.keep = {
            "pwd": true
        };
        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            lib.pwd.compare(soajs.servicesConfig, inputmaskData.oldPassword, userRecord.password, bl.user.localConfig, (error, response) => {
                if (error && !response) {
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
            data.service = "forgotPassword";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                //close model
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                lib.mail.send(soajs, "forgotPassword", userRecord, tokenRecord, function (error, mailRecord) {
                    if (error) {
                        soajs.log.info('forgotPassword: No Mail was sent: ' + error);
                    }
                    return cb(null, {
                        token: tokenRecord.token,
                        link: mailRecord.link || null
                    });
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
        }
        else {
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

        bl.user.getUser(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            inputmaskData._id = userRecord._id;

            let doEdit = () => {
                bl.user.edit(soajs, inputmaskData, options, (error) => {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
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
            }
            else {
                doEdit();
            }
        });
    }

};

module.exports = bl;