'use strict';

const lib = {
    "mail": require("../../lib/mail.js"),
    "pin": require("../../lib/pin.js")
};

let bl = null;
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

    let doEdit = () => {
        modelObj.deleteUpdatePin(data, (err, record) => {
            bl.user.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    };

    if (inputmaskData && inputmaskData.pin && inputmaskData.pin.delete) {
        data.pin = {"delete": true};
        doEdit();
    }
    else {
        data.pin = {};
        if (inputmaskData && inputmaskData.pin && inputmaskData.pin.hasOwnProperty("allowed")) {
            data.pin.allowed = !!inputmaskData.pin.allowed;
        }
        if (inputmaskData && inputmaskData.pin && inputmaskData.pin.reset) {
            let generatedPin = null;
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
        doEdit();
    }
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};