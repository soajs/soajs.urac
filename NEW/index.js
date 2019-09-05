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

        service.get("/admin/groups", function (req, res) {
            bl.group.list(req.soajs, req.soajs.inputmaskData, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        service.start();
    });
});