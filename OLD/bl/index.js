'use strict';


let SSOT = {};

let modelInit = false;

/**
 * Initialize the Business Logic
 * @param {Object} soajs
 * @param {Function} cb
 */
function init(soajs, cb) {
    if (modelInit)
        return cb(null);
    let modelName = soajs.config.model;
    if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.model)
        modelName = soajs.servicesConfig.urac.model;
    let userModel = __dirname + "../model/" + modelName + "/user.js";
    if (fs.existsSync(userModel))
        SSOT.user = require(userModel);
    let groupModel = __dirname + "../model/" + modelName + "/group.js";
    if (fs.existsSync(groupModel))
        SSOT.group = require(groupModel);

    if (SSOT.user && SSOT.group) {
        modelInit = true;
        return cb(null);
    }
    else {
        soajs.log.error('Requested model not found. make sure you have a model for user and another one for group!');
        return cb({"code": 601, "msg": soajs.config.errors[601]});
    }
}

let BL = {
    group: require("./group.js")
};






module.exports = BL;


