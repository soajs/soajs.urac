'use strict';

let group = {
    _id: "5d95da834dcd8a4d1d822ef4",
    code: "CCCC",
    name: "Unit test",
    description: "Added by unit test importer.",
    config: {
        allowedPackages: {
            DSBRD: [
                "DSBRD_DEVOP"
            ]
        },
        allowedEnvironments: {
            DEV: {

            }
        }
    },
    tenant: {
        id: "5d9321f8b40e09438afbd0e3",
        code: "client",
        pin: {
            code: "1235",
            allowed: true
        }
    }
};

module.exports = group;