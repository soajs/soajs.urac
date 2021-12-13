'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "generateUsername": require("../../lib/generateUsername.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs, options);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    if (!inputmaskData.username) {
        inputmaskData.username = lib.generateUsername();
    }
    bl.token.get(soajs, {"token": inputmaskData.code, "service": 'inviteToJoin'}, options, (error, tokenRecord) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        let joinInviteStrict = false;
        if (soajs.servicesConfig.urac && Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'joinInviteStrict')) {
            joinInviteStrict = soajs.servicesConfig.urac.joinInviteStrict;
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('joinInviteFlex')) {
            joinInviteStrict = soajs.registry.custom.urac.value.joinInviteStrict;
        }
        if (joinInviteStrict) {
            //NOTE: at this point tokenRecord is assured
            if (tokenRecord.email !== inputmaskData.email) {
                return cb(bl.user.handleError(soajs, 537, null));
            }
            if (tokenRecord.phone !== inputmaskData.phone) {
                return cb(bl.user.handleError(soajs, 537, null));
            }
        }
        if (!inputmaskData.firstName) {
            inputmaskData.firstName = tokenRecord.firstName;
        }
        if (!inputmaskData.lastName) {
            inputmaskData.lastName = tokenRecord.lastName;
        }
        if (!inputmaskData.phone) {
            inputmaskData.phone = tokenRecord.phone;
        }
        if (!inputmaskData.membership) {
            inputmaskData.membership = tokenRecord.membership;
        }
        inputmaskData.emailConfirmed = tokenRecord.email === inputmaskData.email;

        bl.joinCode(soajs, inputmaskData, options, cb);
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};
