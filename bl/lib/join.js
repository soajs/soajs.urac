'use strict';

let bl = null;
let lib = (soajs, inputmaskData, options, cb) => {
    if (soajs.tenant.type === "client" && soajs.tenant.main) {
        return cb(bl.user.handleError(soajs, 524, null));
    }

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

        let requireValidation = true;
        if (soajs.servicesConfig.urac) {
            if (Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'validateJoin')) {
                requireValidation = soajs.servicesConfig.urac.validateJoin;
            }
        }
        inputmaskData.status = (requireValidation) ? 'pendingJoin' : 'active';
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
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.service = "join";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                lib.mail.send(soajs, "join", userRecord, tokenRecord, function (error, mailRecord) {
                    if (error) {
                        soajs.log.info('join: No Mail was sent: ' + error);
                    }
                    return cb(null, {
                        token: tokenRecord.token,
                        link: mailRecord.link || null
                    });
                });
            });
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return lib;
};