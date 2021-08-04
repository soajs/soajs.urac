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
    let data = {};
    data.firstName = inputmaskData.firstName;
    data.lastName = inputmaskData.lastName;
    data.email = inputmaskData.email;
    data.phone = inputmaskData.phone;
    data.service = "inviteToJoin";
    data.code = true;

    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;
    bl.token.addInvite(soajs, data, options, (error, tokenRecord) => {
        bl.user.mt.closeModel(modelObj);
        if (error) {
            return cb(error, null);
        }

        //TODO: check twilio configuration at registry and send code by sms to phone
        //  if sms config is there then call send sms to send the code and remove it from the token record

        lib.mail.send(soajs, data.service, data, tokenRecord, function (error) {
            if (error) {
                soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
            }
            return cb(null, true);
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};