'use strict';

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");

const service = new soajs.server.service(config);

service.init(() => {
    bl.init(service, config, (error) => {
        if (error) {
            throw new Error('Failed starting service');
        }

        //GET methods
        service.get("/password/forgot", function (req, res) {
            bl.forgotPassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
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
        service.get("/validate/changeEmail", function (req, res) {
            bl.validateChangeEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/user", function (req, res) {
            bl.user.getUserByUsername(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/user", function (req, res) {
            bl.user.getUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/users", function (req, res) {
            bl.user.getUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
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

        //DELETE methods
        service.delete("/admin/group", function (req, res) {
            bl.deleteGroup(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
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
        service.put("admin/groups/environments", function (req, res) {
            bl.group.updateEnvironments(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/groups/packages", function (req, res) {
            bl.group.updatePackages(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/user/invite", function (req, res) {
            bl.inviteUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/user/uninvite", function (req, res) {
            bl.user.uninvite(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/users/invite", function (req, res) {
            bl.inviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/users/uninvite", function (req, res) {
            bl.uninviteUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //POST methods
        service.post("/join", function (req, res) {
            bl.join(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/user", function (req, res) {
            bl.addUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/group", function (req, res) {
            bl.group.add(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/users/ids", function (req, res) {
            bl.user.getUsersByIds(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });


        service.start();
    });
});