'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let lib = {
    "config": (soajs, localConfig) => {
        //service Config
	    if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.pinConfiguration && soajs.servicesConfig.urac.pinConfiguration.charLength && soajs.servicesConfig.urac.pinConfiguration.characters) {
		    return soajs.servicesConfig.urac.pinConfiguration;
	    }
        //custom registry
        else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.pinConfiguration && soajs.registry.custom.pinConfiguration.value && soajs.registry.custom.pinConfiguration.value.charLength && soajs.registry.custom.pinConfiguration.value.characters) {
            return soajs.registry.custom.pinConfiguration.value;
        }
        //default
        else {
		    return localConfig.pinConfiguration;
        }
    },
    "generate": (config) => {
        let result = '';
        let charactersLength = config.characters.length;
        for (let i = 0; i < config.charLength; i++) {
            result += config.characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
};

module.exports = lib;
