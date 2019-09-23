'use strict';

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
    async.each(inputmaskData.users, function (oneUser, callback) {

        let data = {
            "id": inputmaskData.id || null,
            "username": inputmaskData.username || null
        };
        bl.user.uninvite(soajs, data, options, (error, response) => {
            if (error) {
                let responseObj = {"reason": error.msg};
                records.failed.push(responseObj);
            }
            else {
                if (data.id) {
                    let responseObj = {"id": data.id};
                    records.succeeded.push(responseObj);
                } else {
                    let responseObj = {"username": data.username};
                    records.succeeded.push(responseObj);
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