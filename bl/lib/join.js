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
    "generateUsername": require("../../lib/generateUsername.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    if (soajs.tenant.type === "client" && soajs.tenant.main) {
        return cb(bl.user.handleError(soajs, 524, null));
    }
    let modelObj = bl.user.mt.getModel(soajs, options);
    if (!options || !options.mongoCore) {
        if (!options) {
            options = {};
        }
        options.mongoCore = modelObj.mongoCore;
    }
    inputmaskData = inputmaskData || {};

    if (!inputmaskData.username) {
        inputmaskData.username = lib.generateUsername();
    }
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

        let requireValidation = true;
        if (soajs.servicesConfig.urac && Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'validateJoin')) {
            requireValidation = soajs.servicesConfig.urac.validateJoin;
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('validateJoin')) {
            requireValidation = soajs.registry.custom.urac.value.validateJoin;
        }

        if (inputmaskData.membership) {
            let membershipConfig = null;
            if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.membership) {
                if (soajs.servicesConfig.urac.membership[inputmaskData.membership]) {
                    membershipConfig = soajs.servicesConfig.urac.membership[inputmaskData.membership];
                }
            }
            if (!membershipConfig && soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.membership) {
                if (soajs.registry.custom.urac.value.membership[inputmaskData.membership]) {
                    membershipConfig = soajs.registry.custom.urac.value.membership[inputmaskData.membership];
                }
            }
            if (membershipConfig) {
                if (membershipConfig.groups) {
                    if (Array.isArray(membershipConfig.groups) && membershipConfig.groups.length > 0) {
                        inputmaskData.groups = membershipConfig.groups;
                    } else {
                        soajs.log.warn("Skipping [" + inputmaskData.membership + "] membership setting, groups must be an array of at least one group");
                    }
                }
            } else {
                soajs.log.debug("Skipping [" + inputmaskData.membership + "] membership, unable to find any setting for it");
            }
        }

        inputmaskData.status = (requireValidation) ? 'pendingJoin' : 'active';
        if (inputmaskData.emailConfirmed) {
            inputmaskData.status = 'active';
        }
        inputmaskData.tenant = {
            id: soajs.tenant.id,
            code: soajs.tenant.code
        };

        bl.user.add(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            if (inputmaskData.status === 'active') {
                return cb(null, {
                    status: userRecord.status,
                    id: userRecord._id.toString()
                });
            }
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.service = "join";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                if (inputmaskData.doNotSendEmail) {
                    if (inputmaskData.keepToken) {
                        return cb(null, {
                            status: userRecord.status,
                            id: userRecord._id.toString(),
                            token: tokenRecord.token
                        });
                    } else {
                        return cb(null, {
                            status: userRecord.status,
                            id: userRecord._id.toString()
                        });
                    }
                }
                lib.mail.send(soajs, data.service, userRecord, tokenRecord, function (error) {
                    if (error) {
                        soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
                    }
                    if (inputmaskData.keepToken) {
                        return cb(null, {
                            id: userRecord._id.toString(),
                            status: userRecord.status,
                            token: tokenRecord.token
                        });
                    }
                    return cb(null, {
                        status: userRecord.status,
                        id: userRecord._id.toString()
                    });
                });
            });
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};
