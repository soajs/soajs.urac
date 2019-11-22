'use strict';

let group = {
    "code": "AAAA",
    "name": "Unit test",
    "description": "Added by unit test importer.",
    "config": {
        "allowedPackages": {
            "DSBRD": ["DSBRD_DEVOP"]
        },
        "allowedEnvironments": {
            "DEV": {}
        }
    },
    "tenant": {
        "code": "TES2",
        "id": "5c8d0c4f5653de3985aa0ff2",
        "type": "client",
        "main":{
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        }
    }
};

module.exports = group;