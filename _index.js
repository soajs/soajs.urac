'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");

const service = new soajs.server.service(config);

function run(serviceStartCb) {
    service.init(() => {
        bl.init(service, config, (error) => {
            if (error) {
                throw new Error('Failed starting service');
            }

            //GET methods
            service.get("/password/forgot/code", function (req, res) {
                req.soajs.inputmaskData.code = true;
                req.soajs.inputmaskData.service = "forgotPassword_code";
                bl.forgotPassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/password/forgot", function (req, res) {
                req.soajs.inputmaskData.service = "forgotPassword";
                bl.forgotPassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/validate/join/code", function (req, res) {
                bl.validateJoinCode(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/validate/join", function (req, res) {
                bl.validateJoin(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/checkUsername", function (req, res) {
                bl.user.countUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/emailToken", function (req, res) {
                bl.emailToken(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/resend/code", function (req, res) {
                bl.resendCode(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/validate/changeEmail", function (req, res) {
                bl.validateChangeEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/user", function (req, res) {
                req.soajs.inputmaskData.status = "active";
                bl.user.getUserByUsername(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/user/me", function (req, res) {
                req.soajs.inputmaskData.id = req.soajs.urac._id;
                bl.user.getUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/users", function (req, res) {
                bl.user.getUsersBasicInfo(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/user", function (req, res) {
                bl.user.getUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/user/tenants", function (req, res) {
                bl.user.getUserTenants(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/admin/users/ids", function (req, res) {
                bl.user.getUsersByIds(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/users", function (req, res) {
                bl.user.getUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/v2/admin/users", function (req, res) {
                bl.user.getUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    bl.user.countUsers(req.soajs, req.soajs.inputmaskData, null, (error, countData) => {
                        return res.json(req.soajs.buildResponse(error, {
                            count: countData,
                            items: data
                        }));
                    });
                });
            });
            service.get("/admin/users/count", function (req, res) {
                bl.user.countUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/groups", function (req, res) {
                bl.group.getGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/groups/tenant", function (req, res) {
                bl.group.getGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/group", function (req, res) {
                bl.group.getGroup(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/all", function (req, res) {
                bl.getUsersAndGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.get("/admin/tokens", function (req, res) {
                bl.token.search(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            //DELETE methods
            service.delete("/admin/group", function (req, res) {
                bl.deleteGroup(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.delete("/admin/user", function (req, res) {
                bl.user.delete(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            //PUT methods
            service.put("/password/reset", function (req, res) {
                bl.resetPassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/account/password", function (req, res) {
                bl.changePassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/account/email/code", function (req, res) {
                req.soajs.inputmaskData.code = true;
                req.soajs.inputmaskData.service = "changeEmail_code";
                bl.changeEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/account/email", function (req, res) {
                bl.changeEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/account", function (req, res) {
                bl.user.edit(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/user", function (req, res) {
                bl.editUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            service.put("/admin/user/groups", function (req, res) {
                bl.user.editGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/user/pin", function (req, res) {
                bl.editPin(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/user/status", function (req, res) {
                bl.user.updateStatus(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/group", function (req, res) {
                bl.group.edit(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/groups/environments", function (req, res) {
                bl.group.updateEnvironments(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/groups/packages", function (req, res) {
                bl.group.updatePackages(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            service.put("/admin/user/self/invite", function (req, res) {
                bl.selfInvite(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            /*
            service.put("/admin/user/uninvite", function (req, res) {
                bl.user.uninvite(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            */
            service.put("/admin/users/invite", function (req, res) {
                bl.inviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/users/invite/tenant", function (req, res) {
                bl.inviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/users/uninvite", function (req, res) {
                bl.uninviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.put("/admin/users/uninvite/tenant", function (req, res) {
                bl.uninviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            //POST methods
            service.post("/email", function (req, res) {
                bl.sendCustomEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/invite", function (req, res) {
                bl.inviteToJoin(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/join/invite", function (req, res) {
                bl.joinInvite(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/join", function (req, res) {
                bl.join(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/join/code", function (req, res) {
                req.soajs.inputmaskData.emailConfirmed = false;
                bl.joinCode(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/admin/user", function (req, res) {
                bl.addUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/admin/user/tenant", function (req, res) {
                bl.addUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/admin/group", function (req, res) {
                bl.group.add(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });
            service.post("/admin/groups", function (req, res) {
                bl.group.add_multiple(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                    return res.json(req.soajs.buildResponse(error, data));
                });
            });

            service.start(serviceStartCb);
        });
    });
}

function stop(serviceStopCb) {
    service.stop(serviceStopCb);
}

module.exports = {
    "runService": (serviceStartCb) => {
        if (serviceStartCb && typeof serviceStartCb === "function") {
            run(serviceStartCb);
        } else {
            run(null);
        }
    },
    "stopService": (serviceStopCb) => {
        if (serviceStopCb && typeof serviceStopCb === "function") {
            stop(serviceStopCb);
        } else {
            stop(null);
        }
    }
};
