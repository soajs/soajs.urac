'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajsCore = require('soajs');
const path = require("path");
const fs = require('fs');

let lib = {
    /**
     *
     * @param soajs
     * @param service
     * @param data
     *          mandatory {email} + what is being used in every service template
     *          optional {ts}
     *          the bl adds {link, limit, ts}
     * @param options
     * @param cb
     * @returns {*}
     */
    "send": function (soajs, service, data, options, cb) {
        let mailConf = null;
        if (soajs.servicesConfig.mail && soajs.servicesConfig.mail.transport && soajs.servicesConfig.mail.from) {
            mailConf = soajs.servicesConfig.mail;
        }
        else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.mail && soajs.registry.custom.mail.value) {
            mailConf = soajs.registry.custom.mail.value;
        }
        let transportConfiguration = null;
        let from = "";
        if (mailConf) {
            transportConfiguration = mailConf.transport;
            from = mailConf.from;
            let uracConf = null;
            if (soajs.servicesConfig.urac && soajs.servicesConfig.urac.mail && soajs.servicesConfig.urac.mail[service]) {
                uracConf = soajs.servicesConfig.urac;
            }
            else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value) {
                uracConf = soajs.registry.custom.urac.value;
            }
            if (uracConf) {
                if (uracConf.link && uracConf.link[service] && options && options.token) {
                    let link = uracConf.link[service];
                    link += (link.indexOf("?") === -1) ? '?token=' + options.token : "&token=" + options.token;
                    data.link = {
                        [service]: link
                    };
                }
                if (options && options.ttl){
                    data.limit = options.ttl / (3600 * 1000);
                }

                let mailer = new (soajsCore.mail)(transportConfiguration);
                if (data.ts) {
                    let ts = new Date();
                    data.ts = ts.toString();
                }
                let mailOptions = {
                    'to': data.email,
                    'from': from,
                    'subject': uracConf.mail[service].subject,
                    'data': data
                };
                if (uracConf.mail[service] && uracConf.mail[service].content) {
                    mailOptions.content = uracConf.mail[service].content;
                } else {
                    mailOptions.path = path.normalize(__dirname + "/../mail/urac/" + service + ".tmpl");

                    if (fs.existsSync(uracConf.mail[service].path)) {
                        mailOptions.path = uracConf.mail[service].path;
                    }
                }

                if (process.env.SOAJS_TEST) {
                    return cb(null, data);
                }

                mailer.send(mailOptions, function (error) {
                    return cb(error, data);
                });
            }
            else {
                let error = new Error("URAC mail configuration is missing! for: " + service);
                return cb(error, data);
            }
        }
        else {
            let error = new Error("Mail configuration is missing! for: " + service);
            return cb(error, data);
        }
    }
};

module.exports = lib;