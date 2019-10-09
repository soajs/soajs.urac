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
        /**
         * The below gives the option to have from && transport configured at different level, one at custom registry and one at provision
         */
        let mailConf = {};
        if (soajs.servicesConfig.mail) {
            if (soajs.servicesConfig.mail.transport) {
                mailConf.transport = soajs.servicesConfig.mail.transport;
            }
            if (soajs.servicesConfig.mail.from) {
                mailConf.from = soajs.servicesConfig.mail.from;
            }
        }
        if (soajs.registry && soajs.registry.custom && soajs.registry.custom.mail && soajs.registry.custom.mail.value) {
            if (!mailConf.from && soajs.registry.custom.mail.value.from) {
                mailConf.from = soajs.registry.custom.mail.value.from;
            }
            if (!mailConf.transport && soajs.registry.custom.mail.value.transport) {
                mailConf.transport = soajs.registry.custom.mail.value.transport;
            }
        }
        if (mailConf && mailConf.transport && mailConf.from) {
            let transportConfiguration = mailConf.transport;
            let from = mailConf.from;

            /**
             * The below gives the option to have link && mail configured at different level per service, one at custom registry and one at provision
             */
            let serviceMailConf = {
                "link": null,
                "mail": null
            };
            if (soajs.servicesConfig.urac && soajs.servicesConfig.urac.mail && soajs.servicesConfig.urac.mail[service]) {
                let linkConf = soajs.servicesConfig.urac.link;
                let mailCOnf = soajs.servicesConfig.urac.mail;
                if (linkConf && linkConf[service]) {
                    serviceMailConf.link = linkConf[service];
                }
                if (mailCOnf && mailCOnf[service]) {
                    serviceMailConf.mail = mailCOnf[service];
                }
            }
            if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value) {
                let linkConf = soajs.registry.custom.urac.value.link;
                let mailCOnf = soajs.registry.custom.urac.value.mail;
                if (!serviceMailConf.link && linkConf[service]) {
                    serviceMailConf.link = linkConf[service];
                }
                if (!serviceMailConf.mail && mailCOnf[service]) {
                    serviceMailConf.mail = mailCOnf[service];
                }
            }
            if (serviceMailConf && serviceMailConf.mail) {
                if (serviceMailConf.link && options && options.token) {
                    serviceMailConf.link += (serviceMailConf.link.indexOf("?") === -1) ? '?token=' + options.token : "&token=" + options.token;
                    data.link = {
                        [service]: serviceMailConf.link
                    };
                }
                if (options && options.ttl) {
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
                    'subject': serviceMailConf.mail.subject,
                    'data': data
                };
                if (serviceMailConf.mail.content) {
                    mailOptions.content = serviceMailConf.mail.content;
                } else {
                    mailOptions.path = path.normalize(__dirname + "/../mail/urac/" + service + ".tmpl");

                    if (fs.existsSync(serviceMailConf.mail.path)) {
                        mailOptions.path = serviceMailConf.mail.path;
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
            let error = new Error("Mail configuration is missing [from && transport]! for: " + service);
            return cb(error, data);
        }
    }
};

module.exports = lib;