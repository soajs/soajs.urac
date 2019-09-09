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
        service.get("/forgotPassword", function (req, res) {
            bl.forgotPassword(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/join/validate", function (req, res) {
            bl.joinValidate(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/checkUsername", function (req, res) {
            bl.user.countUser(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/user", function (req, res) {
            bl.user.getUser(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/users", function (req, res) {
            bl.user.getUsers(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/groups", function (req, res) {
            bl.group.getGroups(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/group", function (req, res) {
            bl.group.getGroup(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //DELETE methods
        service.delete("/admin/group", function (req, res) {
            bl.deleteGroup(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //PUT methods
        service.put("/admin/group", function (req, res) {
            bl.group.edit(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //POST methods
        service.post("/admin/group", function (req, res) {
            bl.group.add(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("admin/groups/environments", function (req, res) {
            bl.group.addEnvironments(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/groups/packages", function (req, res) {
            bl.group.addPackages(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });


        service.start();
    });
});