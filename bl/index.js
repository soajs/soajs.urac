'use strict';

const uuid = require('uuid');

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
    group: require("./group.js"),
    user: require("./user.js"),
    token: require("./token.js"),

    // Add User
    "addUser": (soajs, inputmaskData, userModelObj, tokenModelObj, cb) => {
        let data = {};

        // Check if User already exists and if not add user

        userModelObj.checkIfExists((data, err) => {
            if (data) {
                return cb({
                    "code": 402,
                    "msg": soajs.config.errors[402]
                });
            }
            /*
            * Check if staus is active and password exists
            * Otherwise create a password randomly
            * Encrypt password
            */

            let password = null;
            if (inputmaskData.status === 'active' && inputmaskData.password && inputmaskData.password !== '') {
                password = inputmaskData.password;
            } else {
                password = utils.getRandomString(12, soajs.config);
            }

            password = utils.encryptPwd(soajs.servicesConfig.urac, password, soajs.config);

            data.firstName = inputmaskData.firstName;
            data.lastName = inputmaskData.lastName;
            data.username = inputmaskData.username;
            data.email = inputmaskData.email;
            data.password = password;
            data.status = inputmaskData.status;
            data.config = inputmaskData.config;
            data.ts = inputmaskData.ts;

            if (inputmaskData.profile) {
                data.profile = inputmaskData.profile;
            }
            if (inputmaskData.groups) {
                data.groups = inputmaskData.groups;
            }
            if (inputmaskData.tId) {
                modelObj.validateId(data, (err, id) => {
                    if (err) {
                        return cb({
                            "code": 611,
                            "msg": soajs.config.errors[611]
                        });
                    }
                    data.id = id;
                    data.tenant = {
                        id: inputmaskData.tId,
                        code: inputmaskData.tCode
                    }

                    if (inputmaskData.pin) {
                        data.tenant.pin = inputmaskData.pin;
                    }
                    doAdd();
                });
            } else {
                doAdd();
            }

            function doAdd() {
                let tokenExpiryTTL = 2 * 24 * 3600000;
                let dbObject;
                if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.tokenExpiryTTL) {
                    tokenExpiryTTL = soajs.servicesConfig.urac.tokenExpiryTTL;
                }
                userModelObj.addUser(data, (err, record) => {
                    if (err) {
                        return cb({
                            "code": 414,
                            "msg": soajs.config.errors[414]
                        });
                    }
                    dbObject.id = record[0]._d.toString();
                    if (record[0].status !== 'pendingNew') {
                        return cb(null, dbObject);
                    }

                    let tokenRecord = {
                        userId: record[0]._id.toString(),
                        token: uuid.v4(),
                        expires: new Date(new Date().getTime() + tokenExpiryTTL),
                        status: 'active',
                        ts: new Date().getTime(),
                        service: 'addUser',
                        username: record[0].username
                    }
                    // Add token

                    tokenModelObj.addToken(tokenRecord, (err, token) => {
                        if (err) {

                        }
                        if (soajs.servicesConfig.mail && soajs.servicesConfig.urac && soajs.servicesConfig.urac.mail && soajs.servicesConfig.urac.mail.addUser) {
                            let obj = data;

                            obj.link= {
                                addUser: utils.addTokenToLink(soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
                            };

                            //Send mail
                        } else {
                            soajs.log.info('No Mail sent on add User');
                            return cb(null, dbObject);
                        }
                    });
                });
            }
        });
    },

    // Edit and Delete Group from user

};






module.exports = BL;


