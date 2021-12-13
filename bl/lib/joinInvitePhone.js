'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs, options);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    if (!inputmaskData.username) {
        inputmaskData.username = inputmaskData.phone;
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
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('joinInviteStrict')) {
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
        if (!inputmaskData.email) {
            inputmaskData.email = tokenRecord.email;
        }
        if (!inputmaskData.membership) {
            inputmaskData.membership = tokenRecord.membership;
        }
        inputmaskData.phoneConfirmed = tokenRecord.phone === inputmaskData.phone;

        bl.joinCode(soajs, inputmaskData, options, cb);
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};
