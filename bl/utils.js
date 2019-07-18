"use strict";

let Hasher = soajsCore.hasher;

let bl = {

    /**
     *
     * @param {Object} servicesConfig
     * @param {String} password
     * @param {Object} config
     *
     */
    "encryptPassword": function (servicesConfig, password, config) {
        let hashConfig = {
            "hashIterations": config.hashIterations,
            "seedLength": config.seedLength
        };
        if (servicesConfig && servicesConfig.hashIterations && servicesConfig.seedLength) {
            hashConfig = {
                "hashIterations": servicesConfig.hashIterations,
                "seedLength": servicesConfig.seedLength
            };
        }

        Hasher.init(hashConfig);
        if (servicesConfig && servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
            let crypto = require("crypto");
            let hash = crypto.createHash(servicesConfig.optionalAlgorithm);
            password = hash.update(password).digest('hex');
        }

        return Hasher.hash(password);
    },
}

module.exports = bl;

