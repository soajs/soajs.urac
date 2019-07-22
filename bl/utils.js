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

    "makePin": function (pinCode) {
        let result = '';
        let charactersLength = pinCode.characters.length;
        for (let i = 0; i < pinCode.charLength; i++) {
            result += pinCode.characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    /**
     * Generate a random string
     * @param {Number} length
     * @param {object} config
     */
    "getRandomString": function (length, config) {
        function getLetter() {
            var start = process.hrtime()[1] % 2 === 0 ? 97 : 65;
            return String.fromCharCode(Math.floor((start + Math.random() * 26)));
        }

        function getNumber() {
            return String.fromCharCode(Math.floor((48 + Math.random() * 10)));
        }

        length = length || Math.ceil(Math.random() * config.maxStringLimit);
        var qs = '';

        while (length) {
            qs += process.hrtime()[1] % 2 === 0 ? getLetter() : getNumber();
            length--;
        }

        return qs.replace(/\s/g, '_');
    },
}

module.exports = bl;
