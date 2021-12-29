'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "mail": null,
    "pin": require("../../lib/pin.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    inputmaskData = inputmaskData || {};

    if (soajs.tenant.type !== "product") {
        return cb(bl.user.handleError(soajs, 535, null));
    }
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    let data = {
        "status": "active"
    };

    let goInvite = (error, userRecord) => {
        if (error) {
            return cb(error);
        }
        if (userRecord.tenant.id === inputmaskData.tenant.id) {
            return cb(bl.user.handleError(soajs, 536, null));
        }
        if (!userRecord.config) {
            userRecord.config = {};
        }
        if (!userRecord.config.allowedTenants) {
            userRecord.config.allowedTenants = [];
        }
        let found = false;
        if (userRecord.config.allowedTenants.length > 0) {
            userRecord.config.allowedTenants.forEach((oneTenant) => {
                if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === inputmaskData.tenant.id) {
                    found = true;
                }
            });
        }
        if (found) {
            return cb(bl.user.handleError(soajs, 529, null));
        }
        let obj = {
            "tenant": {
                "id": inputmaskData.tenant.id,
                "code": inputmaskData.tenant.code
            }
        };
        obj.tenant.pin = {};
        if (inputmaskData.groups) {
            obj.groups = inputmaskData.groups;
        }

        let generatedPin = null;
        if (inputmaskData.pin && inputmaskData.pin.code) {
            let pinConfig = lib.pin.config(soajs, bl.user.localConfig);
            try {
                generatedPin = lib.pin.generate(pinConfig);
                obj.tenant.pin.code = generatedPin;
                obj.tenant.pin.allowed = !!inputmaskData.pin.allowed;
                if (!userRecord.tenant.pin) {
                    userRecord.tenant.pin = {};
                }
                userRecord.tenant.pin.allowed = !!inputmaskData.pin.allowed;
            } catch (e) {
                return cb(bl.user.handleError(soajs, 525, null));
            }
        }
        userRecord.config.allowedTenants.push(obj);

        modelObj.save(userRecord, (err, response) => {
            if (err) {
                return cb(bl.user.handleError(soajs, 602, err));
            }
            if (response && generatedPin) {
                userRecord.pin = generatedPin;
                lib.mail.send(soajs, 'invitePin', userRecord, null, function (error) {
                    if (error) {
                        soajs.log.info('invitePin: No Mail was sent: ' + error.message);
                    }
                });
            }
            return cb(null, {
                "id": userRecord._id.toString(),
                "tenant": obj.tenant
            });
        });
    };

    if (soajs && soajs.urac && soajs.urac.username) {
        data.username = soajs.urac.username;
        data.keep = {"pin": true};
        bl.user.getUserByUsername(soajs, data, options, (error, userRecord) => {
            return goInvite(error, userRecord);
        });
    } else {
        return cb(bl.user.handleError(soajs, 527, null));
    }
};


module.exports = function (_bl) {
    bl = _bl;
    lib.mail = require("../../lib/mail.js")(bl);
    return local;
};
