"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const BL = helper.requireModule('bl/group.js');
const assert = require('assert');


describe("Unit test for: BL - group", () => {
    let soajs = {
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "log": {
            "error": (msg) => {
                console.log(msg);
            },
            "debug": (msg) => {
                console.log(msg);
            }
        }
    };

    before((done) => {

        BL.localConfig = helper.requireModule("config.js");

        done();
    });

    it("Get groups", function (done) {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getGroups = (data, cb) => {
            if (data && data.error) {
                let error = new Error("Group: getGroups - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, []);
            }
        };
        BL.model = MODEL;

        BL.getGroups(soajs, null, null, (error, records) => {
            assert.ok(records);
            assert.ok(Array.isArray(records));

            BL.getGroups(soajs, {"error": 1}, null, (error) => {
                assert.ok(error);
                done();
            });

        });
    });
    it("Get group ", function (done) {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getGroup = (data, cb) => {
            if (data && data.code === "CCCC") {
                return cb(null, null);
            } else if (data && data.code === "AAAA") {
                let error = new Error("Group: getGroup - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, {"code": "BBBB"});
            }
        };
        BL.model = MODEL;

        BL.getGroup(soajs, null, null, (error) => {
            assert.ok(error);

            let data = {
                "id": "5cfb05c22ac09278709d0141",
                "code": "BBBB"
            };
            BL.getGroup(soajs, data, null, (error, record) => {
                assert.ok(record);
                assert.equal(record.code, 'BBBB');

                let data = {
                    "code": "CCCC"
                };
                BL.getGroup(soajs, data, null, (error) => {
                    assert.ok(error);

                    let data = {
                        "code": "AAAA"
                    };
                    BL.getGroup(soajs, data, null, (error) => {
                        assert.ok(error);
                        done();
                    });
                });
            });

        });
    });
    it("Add group ", function (done) {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.add = (data, cb) => {
            if (data && data.code === "AAAA") {
                let error = new Error("Group: Add - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, data);
            }
        };
        BL.model = MODEL;

        BL.add(soajs, null, null, (error) => {
            assert.ok(error);

            let data = {
                "id": "5cfb05c22ac09278709d0141",
                "code": "BBBB",
                "name": "inputmaskData.name",
                "description": "inputmaskData.description",
                "environments": ["dev", "stg"],
                "packages": [{"product": "prod", "package": "pack"}]
            };
            BL.add(soajs, data, null, (error, record) => {
                assert.ok(record);
                assert.equal(record.code, "BBBB");
                assert.equal(record.tId, soajs.tenant.id);
                let data = {
                    "code": "AAAA"
                };
                BL.add(soajs, data, null, (error) => {
                    assert.ok(error);
                    done();
                });
            });

        });
    });
    it('Edit Group', (done) => {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.edit = (data, cb) => {
            if (data && data.name === "ExistGroup" && data.id === "ExistGroupID") {
                let error = new Error("Group: Edit - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, data);
            }
        };
        BL.model = MODEL;

        BL.edit(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                "id": '5cfb05c22ac09278709d0141',
                "name": "unit test",
                "description": "modified by unit test",
                "environments": ["test", "stg"],
                "packages": [
                    {product: "hage", package: "spiro"},
                    {product: "hage", package: "farid"},
                    {product: "soajs", package: "console"}
                ]
            };

            BL.edit(soajs, data, null, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result.id, '5cfb05c22ac09278709d0141');
                assert.deepEqual(result.name, 'unit test');

                data.name = "ExistGroup";
                data.id = "ExistGroupID";

                BL.edit(soajs, data, null, (err) => {
                    assert.ok(err);
                    assert.deepEqual(err.code, 602);
                    done();
                });
            });
        });
    });
    it('Update environment in Group', (done) => {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.updateEnvironments = (data, cb) => {
            if (data && data.environments === ["notFound"]) {
                let error = new Error("Group: Update Environment - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, data);
            }
        };

        BL.model = MODEL;

        BL.updateEnvironments(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                "environments": ["test", "stg"],
                "groups": ["CCCC", "AAAA"]
            };

            BL.updateEnvironments(soajs, data, null, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, {environments: ['test', 'stg'], groups: ['CCCC', 'AAAA']});

                done();

                //TODO: Check with Antoine for err coverage
                // data.environments = ["notFound"];
                //
                // BL.updateEnvironments(soajs, data, null, (err) => {
                //     assert.ok(err);
                //     assert.deepEqual(err.code, 602);
                //     done();
                // });
            });
        });
    });
    it('Update packages in Group', (done) => {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.updatePackages = (data, cb) => {
            if (data && data.packages === ["notFound"]) {
                let error = new Error("Group: Update Packages - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, data);
            }
        };

        BL.model = MODEL;

        BL.updatePackages(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                "packages": [
                    {product: "test", package: "PACK"},
                    {product: "soajs", package: "gateway"}
                ],
                "groups": ["CCCC", "AAAA"]
            };

            BL.updatePackages(soajs, data, null, (err, result) => {
                console.log("reso", result);
                assert.ok(result);
                assert.deepEqual(result, { packages:
                        [ { product: 'test', package: 'PACK' },
                            { product: 'soajs', package: 'gateway' } ],
                    groups: [ 'CCCC', 'AAAA' ] });

                done();

                //TODO: Check with Antoine for err coverage
                // data.packages = ["notFound"];
                //
                // BL.updatePackages(soajs, data, null, (err) => {
                //     assert.ok(err);
                //     assert.deepEqual(err.code, 602);
                //     done();
                // });
            });
        });
    });

    it('Delete Group', (done) => {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.delete = (data, cb) => {
            if (data && data.id === "notFoundID") {
                let error = new Error("Group: Delete - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, data);
            }
        };
        BL.model = MODEL;

        BL.deleteGroup(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                id: '5cfb05c22ac09278709d0141'
            };
            BL.deleteGroup(soajs, data, null, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, {id: '5cfb05c22ac09278709d0141'});

                data.id = 'notFoundID';
                BL.deleteGroup(soajs, data, null, (error) => {
                    assert.ok(error);
                    assert.deepEqual(error, {code: 602, msg: 'Model error: Group: Delete - mongo error.'});
                    done();
                });
            });
        });
    });


});