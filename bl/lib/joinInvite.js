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

    // TODO: finish the code
    // fetch token record and check if the phone and email matches
    // if yes call join
    // if not return error
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
        bl.join(soajs, inputmaskData, options, (error, response) => {
            bl.user.mt.closeModel(modelObj);
            return cb(error, response);
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};