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

        service.get("/admin/groups", function (req, res) {
            bl.group.list(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        service.start();
    });
});