'use strict';

const lib = {
    "mail": require("../../lib/mail.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};

    bl.user.countUser(soajs, inputmaskData, options, (error, found) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        if (found) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(bl.user.handleError(soajs, 402, null));
        }

        inputmaskData.config = inputmaskData.config || {};

        let doAdd = (pin, pinCode) => {

            bl.user.add(soajs, inputmaskData, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                if (pin) {
                    userRecord.pin = pinCode;
                    lib.mail.send(soajs, 'invitePin', userRecord, null, function (error) {
                        if (error)
                            soajs.log.info('invitePin: No Mail was sent: ' + error);
                    });
                }
                if (userRecord.status !== "pendingNew") {
                    return cb(null, {
                        id: userRecord._id.toString()
                    });
                }
                let data = {};
                data.userId = userRecord._id.toString();
                data.username = userRecord.username;
                data.service = "addUser";
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    lib.mail.send(soajs, "addUser", userRecord, tokenRecord, function (error, mailRecord) {
                        if (error) {
                            soajs.log.info('addUser: No Mail was sent: ' + error);
                        }
                        return cb(null, {
                            id: userRecord._id.toString(),
                            token: tokenRecord.token,
                            link: mailRecord.link || null
                        });
                    });
                });
            });
        };
        let doPin = (mainTenant) => {
            let generatedPin = null;
            if (inputmaskData.pin) {
                if (inputmaskData.pin.code) {
                    let getPinCodeConfig = (soajs) => {
                        //service Config
                        if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.pinConfiguration && soajs.servicesConfig.urac.pinConfiguration.charLength && soajs.servicesConfig.pinConfiguration.pin.characters) {
                            return soajs.servicesConfig.pinConfiguration.pin;
                        }
                        //custom registry
                        else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.pinConfiguration && soajs.registry.custom.pinConfiguration.value && soajs.registry.custom.pinConfiguration.value.charLength && soajs.registry.custom.pinConfiguration.value.characters) {
                            return soajs.registry.custom.pinConfiguration.value;
                        }
                        //default
                        else {
                            return bl.localConfig.pinConfiguration;
                        }
                    };
                    let makePin = (pinCode) => {
                        let result = '';
                        let charactersLength = pinCode.characters.length;
                        for (let i = 0; i < pinCode.charLength; i++) {
                            result += pinCode.characters.charAt(Math.floor(Math.random() * charactersLength));
                        }
                        return result;
                    };
                    let pinCode = getPinCodeConfig(soajs);
                    try {
                        generatedPin = makePin(pinCode);
                        if (mainTenant) {
                            inputmaskData.tenant.pin.code = generatedPin;
                            inputmaskData.tenant.pin.allowed = !!inputmaskData.tenant.pin.allowed;
                        }
                        else {
                            inputmaskData.config.allowedTenants[0].tenant.pin.code = generatedPin;
                            inputmaskData.config.allowedTenants[0].tenant.pin.allowed = !!inputmaskData.tenant.pin.allowed;
                        }
                        doAdd(true, generatedPin);
                    } catch (e) {
                        return cb(bl.user.handleError(soajs, 525, e));
                    }
                }
            }

            doAdd(false, null);
        };

        if (soajs.tenant.type === "client" && soajs.tenant.main) {
            inputmaskData.tenant = {
                id: soajs.tenant.main.id,
                code: soajs.tenant.main.code
            };
            if (!inputmaskData.config.allowedTenants) {
                inputmaskData.config.allowedTenants = [];
            }
            let allowedTenantObj = {
                "tenant": {
                    "id": soajs.tenant.id,
                    "code": soajs.tenant.code
                }
            };
            if (inputmaskData.groups) {
                allowedTenantObj.groups = inputmaskData.groups;
                inputmaskData.groups = [];
            }

            inputmaskData.config.allowedTenants.push(allowedTenantObj);

            doPin(false);
        } else {
            inputmaskData.tenant = {
                id: soajs.tenant.id,
                code: soajs.tenant.code
            };

            doPin(true);
        }
    });
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};