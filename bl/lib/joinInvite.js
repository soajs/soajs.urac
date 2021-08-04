'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

// const lib = {
//     "mail": require("../../lib/mail.js")
// };

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {



    const userRecord = {
        "_id": "notImplementedYet"
    };
    return cb(null, {
        id: userRecord._id.toString()
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};