"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/token.js');
const assert = require('assert');

describe("Unit test for: BL - token", () => {
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

    it('Add Token', (done) => {
        function MODEL() {
            console.log("token model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.add = (data, cb) => {
            if (data && data.userId && data.userId === {}) {
                let error = new Error("Token: Add Token - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, {token: 'f0426a88-3320-4463-baf5-abc092cc4bec', ttl: '12'});
            }
        };
        BL.model = MODEL;

        BL.add(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                userId: 'userID',
                username: 'userName',
                service: 'addUser'
            };

            BL.add(soajs, data, null, (err, record) => {
                assert.ok(record);
                assert.deepEqual(record.token, 'f0426a88-3320-4463-baf5-abc092cc4bec');

                done();

                // data.userId = {};
                //
                // BL.add(soajs, data, null, (err) => {
                //     assert.ok(err);
                //     assert.deepEqual(err.code, 602);
                //
                //     done();
                // });
            });
        });
    });
    it('Get Token', (done) => {
        function MODEL() {
            console.log("token model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.get = (data, cb) => {
            if (data && data.token && data.token === 'error') {
                let error = new Error("Token: Get Token - mongo error.");
                return cb(error, null);
            } else if (data && data.token && data.token === 'empty') {
                return cb(null, null);
            } else if (data && data.token && data.token === 'expired') {
                return cb(null, {
                    _id: "tokenID",
                    userId: 'userID',
                    token: 'f65e8358-ce1d-47cb-b478-82e10c93f70e',
                    expires: '2019-1-1T08:43:19.051Z',
                    status: 'active',
                    ts: 1563784999051,
                    service: 'addUser',
                    username: 'userName'
                });
            } else {
                return cb(null, {
                    _id: "tokenID",
                    userId: 'userID',
                    token: 'f65e8358-ce1d-47cb-b478-82e10c93f70e',
                    expires: '2019-12-24T08:43:19.051Z',
                    status: 'active',
                    ts: 1563784999051,
                    service: 'addUser',
                    username: 'userName'
                });
            }
        };
        BL.model = MODEL;

        BL.get(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                id: 'tokenID',
                token: 'f65e8358-ce1d-47cb-b478-82e10c93f70e',
            };

            BL.get(soajs, data, null, (err, record) => {
                assert.ok(record);
                assert.deepEqual(record.token, 'f65e8358-ce1d-47cb-b478-82e10c93f70e');
                assert.deepEqual(record.username, 'userName');
                assert.deepEqual(record.expires, '2019-12-24T08:43:19.051Z');

                data.token = 'error';

                BL.get(soajs, data, null, (err) => {
                    assert.ok(err);
                    assert.deepEqual(err.code, 602);

                    data.token = 'empty';

                    BL.get(soajs, data, null, (err) => {
                        assert.ok(err);
                        assert.deepEqual(err, {code: 600, msg: BL.localConfig.errors[600]});

                        done();

                        // data.token = 'expired';
                        //
                        // BL.get(soajs, data, null, (err, result) => {
                        //     done();
                        // });
                    });
                });
            });
        });
    });
    it('Update Token Status', (done) => {
        function MODEL() {
            console.log("token model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.updateStatus = (data, cb) => {
            if (data && data.token && data.token === 'error') {
                let error = new Error("Token: Update Token Status - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, 1);
            }
        };
        BL.model = MODEL;

        BL.updateStatus(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                token: 'f65e8358-ce1d-47cb-b478-82e10c93f70e',
                status: 'active'
            };

            BL.updateStatus(soajs, data, null, (error, result) => {
                assert.ok(result);
                assert.deepEqual(result, 1);

                data.token = 'error';

                BL.updateStatus(soajs, data, null, (error) => {
                    assert.ok(error);
                    assert.deepEqual(error.code, 602);

                    done();
                });
            });
        });
    });
});