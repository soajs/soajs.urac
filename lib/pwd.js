'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const soajsCore = require('soajs');
const Hasher = soajsCore.hasher;
const crypto = require("crypto");

let lib = {

    "encrypt": (servicesConfig, pwd, defaultConfig, cb) => {
        let hashConfig = {
            "hashIterations": defaultConfig.hashIterations
        };
        if (servicesConfig && servicesConfig.hashIterations) {
            hashConfig = {
                "hashIterations": servicesConfig.hashIterations
            };
        }

        Hasher.init(hashConfig);

        if (servicesConfig && servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
            let hash = crypto.createHash(servicesConfig.optionalAlgorithm);
            pwd = hash.update(pwd).digest('hex');
        }

        Hasher.hash(pwd, true, (error, pwdEncrypted) => {
            return cb(error, pwdEncrypted);
        });
    },
    "compare": (servicesConfig, oldPwd, newPwd, defaultConfig, cb) => {
        let hashConfig = {
            "hashIterations": defaultConfig.hashIterations
        };
        if (servicesConfig && servicesConfig.hashIterations) {
            hashConfig = {
                "hashIterations": servicesConfig.hashIterations
            };
        }

        Hasher.init(hashConfig);
        if (servicesConfig && servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
            let hash = crypto.createHash(servicesConfig.optionalAlgorithm);
            oldPwd = hash.update(oldPwd).digest('hex');
        }

        Hasher.compare(oldPwd, newPwd, cb);
    }
};

module.exports = lib;