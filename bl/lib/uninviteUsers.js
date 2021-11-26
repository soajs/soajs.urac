'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const async = require("async");

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    inputmaskData = inputmaskData || {};
    if (!inputmaskData.users) {
        return cb(bl.user.handleError(soajs, 530, null));
    }

    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    let records = {"succeeded": [], "failed": []};
    async.eachLimit(inputmaskData.users, 20, function (oneUser, callback) {

        let data = {
            "user": oneUser.user || null,
            "tenant": oneUser.tenant || null
        };
        bl.user.uninvite(soajs, data, options, (error, response) => {
            if (error) {
                let responseObj = {"reason": error.msg};
                records.failed.push(responseObj);
            }
            else {
                if (data && response) {
                    if (data.user.id) {
                        let responseObj = {"id": data.user.id};
                        records.succeeded.push(responseObj);
                    } else if (data.user.email) {
                        let responseObj = {"email": data.user.email};
                        records.succeeded.push(responseObj);
                    } else {
                        let responseObj = {"username": data.user.username};
                        records.succeeded.push(responseObj);
                    }
                }
            }
            return callback();
        });
    }, function () {
        //close model
        bl.user.mt.closeModel(modelObj);
        return cb(null, records);
    });
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};
