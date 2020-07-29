'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "mail": require("../../lib/mail.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};
    inputmaskData.status = ["pendingJoin", "pendingNew"];
    bl.user.getUserByUsername(soajs, inputmaskData, options, (error, userRecord) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        if (userRecord.status === "pendingNew") {
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.service = "addUser";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                lib.mail.send(soajs, "addUser", userRecord, tokenRecord, function (error, mailRecord) {
                    if (error) {
                        soajs.log.info('addUser: No Mail was sent: ' + error.message);
                    }
                    return cb(null, {
                        id: userRecord._id.toString(),
                        token: tokenRecord.token,
                        link: mailRecord.link || null
                    });
                });
            });
        } else { //"pendingJoin"
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.service = "join";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                lib.mail.send(soajs, "join", userRecord, tokenRecord, function (error, mailRecord) {
                    if (error) {
                        soajs.log.info('join: No Mail was sent: ' + error.message);
                    }
                    return cb(null, {
                        id: userRecord._id.toString(),
                        token: tokenRecord.token,
                        link: mailRecord.link || null
                    });
                });
            });
        }
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};