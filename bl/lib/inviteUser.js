'use strict';

const lib = {
    "mail": require("../../lib/mail.js"),
    "pin": require("../../lib/pin.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    /*
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};
    let data = {
        "status": "active"
    };

    let goInvite = (error, userRecord) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        if (userRecord.locked) {
            return cb(bl.user.handleError(soajs, 528, null), null);
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
                if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === soajs.tenant.id) {
                    found = true;
                }
            });
        }
        if (found) {
            return cb(bl.user.handleError(soajs, 529, null), null);
        }

        let obj = {
            "tenant": {
                "id": soajs.tenant.id,
                "code": soajs.tenant.code
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
            } catch (e) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 525, e));
            }
        }
        userRecord.config.allowedTenants.push(obj);

        modelObj.save(userRecord, (err, response) => {
            //close model
            bl.user.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.user.handleError(soajs, 602, err));
            }
            if (response) {
                userRecord.pin = generatedPin;
                lib.mail.send(soajs, 'invitePin', userRecord, null, function (error) {
                    if (error)
                        soajs.log.info('invitePin: No Mail was sent: ' + error);
                });
            }
            return cb(null, response);
        });
    };

    if (inputmaskData.id) {
        data.id = inputmaskData.id;
        bl.user.getUser(soajs, data, options, (error, userRecord) => {
            return goInvite(error, userRecord);
        });
    }
    if (inputmaskData.username) {
        data.username = inputmaskData.username;
        bl.user.getUserByUsername(soajs, data, options, (error, userRecord) => {
            return goInvite(error, userRecord);
        });
    }
    else {
        return cb(bl.user.handleError(soajs, 527, null), null);
    }
    */
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};