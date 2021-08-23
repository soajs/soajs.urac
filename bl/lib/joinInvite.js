'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "message": require("../../lib/message.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs, options);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    bl.token.get(soajs, {"token": inputmaskData.code, "service": 'inviteToJoin'}, options, (error, tokenRecord) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        // NOTE: at this point tokenRecord is assured
        if (tokenRecord.email !== inputmaskData.email) {
            return cb(bl.user.handleError(soajs, 537, null));
        }
        if (tokenRecord.phone !== inputmaskData.phone) {
            return cb(bl.user.handleError(soajs, 537, null));
        }
        inputmaskData.keepToken = true;
        bl.join(soajs, inputmaskData, options, (error, response) => {
            if (error) {
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            if (inputmaskData.confirmation === "emailAndPhone") {
                let data = {};
                data.firstName = inputmaskData.firstName;
                data.lastName = inputmaskData.lastName;
                data.email = inputmaskData.email;
                data.phone = inputmaskData.phone;
                data.inviteToken = response.token;
                data.service = "joinInvite";
                data.code = true;
                bl.token.addInvite(soajs, data, options, (error, tokenRecord) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    lib.message.send(soajs, data.service, data, tokenRecord, function (error) {
                        if (error) {
                            soajs.log.info(data.service + ': No SMS was sent: ' + error.message);
                        }
                        return cb(null, {"id": response.id});
                    });
                });
            } else {
                bl.user.mt.closeModel(modelObj);
                return cb(null, {"id": response.id});
            }
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};