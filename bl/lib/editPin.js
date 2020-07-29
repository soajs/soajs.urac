'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "mail": require("../../lib/mail.js"),
    "pin": require("../../lib/pin.js")
};

let bl = null;

function handleUpdateResponse (response) {
	if (response) {
		return true;
	} else {
		return false;
	}
}

let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};
    let data = {
        "status": "active",
        "user": inputmaskData.user,
        "tenant": soajs.tenant
    };

    let doEdit = (generatedPin) => {
        modelObj.deleteUpdatePin(data, (err, record) => {
            if (err) {
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 602, err));
            }
	
	        cb(null, handleUpdateResponse(record));
            
            if (generatedPin) {
                let data = {
                    "status": "active"
                };
                let doMail = (error, userRecord) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        soajs.log.info('resetPin: No Mail was sent: ' + error.message);
                    }
                    else {
                        userRecord.pin = generatedPin;
                        lib.mail.send(soajs, 'resetPin', userRecord, null, function (error) {
                            if (error) {
                                soajs.log.info('resetPin: No Mail was sent: ' + error.message);
                            }
                        });
                    }
                };
                if (inputmaskData.user && inputmaskData.user.id) {
                    data.id = inputmaskData.user.id;
                    bl.user.getUser(soajs, data, options, (error, userRecord) => {
                        return doMail(error, userRecord);
                    });
                }
                else {
                    if (inputmaskData.user) {
                        data.username = inputmaskData.user.username || inputmaskData.user.email;
                        bl.user.getUserByUsername(soajs, data, options, (error, userRecord) => {
                            return doMail(error, userRecord);
                        });
                    }
                    else {
                        bl.user.mt.closeModel(modelObj);
                        soajs.log.info('resetPin: No Mail was sent: unable to find user');
                    }
                }
            }
            else {
                bl.user.mt.closeModel(modelObj);
            }
        });
    };

    if (inputmaskData && inputmaskData.pin && inputmaskData.pin.delete) {
        data.pin = {"delete": true};
        doEdit(null);
    }
    else {
        data.pin = {};
        if (inputmaskData && inputmaskData.pin && inputmaskData.pin.hasOwnProperty("allowed")) {
            data.pin.allowed = !!inputmaskData.pin.allowed;
        }
        let generatedPin = null;
        if (inputmaskData && inputmaskData.pin && inputmaskData.pin.reset) {
            let pinConfig = lib.pin.config(soajs, bl.user.localConfig);
            try {
                generatedPin = lib.pin.generate(pinConfig);
                data.pin.code = generatedPin;
            } catch (e) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 525, e));
            }
        }
        doEdit(generatedPin);
    }
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};