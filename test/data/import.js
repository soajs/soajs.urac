'use strict';
const fs = require("fs");
const async = require("async");
let Mongo = require("soajs.core.modules").mongo;


let lib = {
    basic: (config, dataPath, mongoConnection, cb) => {
        let colName = config.colName;
        let condAnchor = config.condAnchor;
        let objId = config.objId;
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate env
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            mongoConnection.dropCollection(colName, () => {
                async.each(
                    records,
                    (e, cb) => {
                        let condition = {[condAnchor]: e[condAnchor]};
                        e[objId] = mongoConnection.ObjectId(e[objId]);
                        e = {$set: e};
                        mongoConnection.updateOne(colName, condition, e, {'upsert': true}, (error, result) => {
                            console.log(colName, error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        } else {
            return cb();
        }
    },
    oauth_token: (dataPath, mongoConnection, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate oauth
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            mongoConnection.dropCollection("oauth_token", () => {
                async.each(
                    records,
                    (e, cb) => {
                        let condition = {token: e.token};
                        e._id = mongoConnection.ObjectId(e._id);
                        if (e && e.user && e.user._id)
                            e.user._id = mongoConnection.ObjectId(e.user._id);
                        e = {$set: e};
                        mongoConnection.updateOne("oauth_token", condition, e, {'upsert': true}, (error, result) => {
                            console.log("oauth_token", error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        } else
            return cb();
    },
    oauth_urac: (dataPath, mongoConnection, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate oauth
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            mongoConnection.dropCollection("oauth_urac", () => {
                async.each(
                    records,
                    (e, cb) => {
                        let condition = {userId: e.userId};
                        e._id = mongoConnection.ObjectId(e._id);
                        if (e && e._id)
                            e._id = mongoConnection.ObjectId(e._id);
                        e = {$set: e};
                        mongoConnection.updateOne("oauth_urac", condition, e, {'upsert': true}, (error, result) => {
                            console.log("oauth_urac", error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        } else
            return cb();
    },

    users: (dataPath, profile, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate user
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            let tenants = [];
            async.eachSeries(
                records,
                (e, cb) => {
                    profile.name = e.tenant.code + "_urac";
                    let mongoConnection = new Mongo(profile);
                    if (tenants.includes(profile.name)) {
                        let condition = {email: e.email};
                        e._id = mongoConnection.ObjectId(e._id);
                        e = {$set: e};
                        mongoConnection.updateOne("users", condition, e, {'upsert': true}, (error, result) => {
                            mongoConnection.closeDb();
                            return cb();
                        });
                    } else {
                        tenants.push(profile.name);
                        mongoConnection.dropCollection("users", () => {
                            let condition = {email: e.email};
                            e._id = mongoConnection.ObjectId(e._id);
                            e = {$set: e};
                            mongoConnection.updateOne("users", condition, e, {'upsert': true}, (error, result) => {
                                mongoConnection.closeDb();
                                return cb();
                            });
                        });
                    }
                },
                () => {
                    return cb();
                });
        } else
            return cb();
    },
    groups: (dataPath, profile, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate group
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            let tenants = [];
            async.eachSeries(
                records,
                (e, cb) => {
                    profile.name = e.tenant.code + "_urac";
                    let mongoConnection = new Mongo(profile);
                    if (tenants.includes(profile.name)) {
                        let condition = {code: e.code};
                        e._id = mongoConnection.ObjectId(e._id);
                        e = {$set: e};
                        mongoConnection.updateOne("groups", condition, e, {'upsert': true}, (error, result) => {
                            console.log("groups", error);
                            mongoConnection.closeDb();
                            return cb();
                        });
                    } else {
                        tenants.push(profile.name);
                        mongoConnection.dropCollection("groups", () => {
                            let condition = {code: e.code};
                            e._id = mongoConnection.ObjectId(e._id);
                            e = {$set: e};
                            mongoConnection.updateOne("groups", condition, e, {'upsert': true}, (error, result) => {
                                console.log("groups", error);
                                mongoConnection.closeDb();
                                return cb();
                            });
                        });
                    }
                },
                () => {
                    return cb();
                });
        } else
            return cb();
    },
    tokens: (dataPath, profile, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate group
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            let tenants = [];
            async.eachSeries(
                records,
                (e, cb) => {
                    profile.name = e.tenant.code + "_urac";
                    let mongoConnection = new Mongo(profile);
                    if (tenants.includes(profile.name)) {
                        if (e.record) {
                            let condition = {token: e.record.token};
                            e.record._id = mongoConnection.ObjectId(e.record._id);
                            e.record = {$set: e.record};
                            mongoConnection.updateOne("tokens", condition, e.record, {'upsert': true}, (error, result) => {
                                console.log("tokens", error);
                                mongoConnection.closeDb();
                                return cb();
                            });
                        } else {
                            return cb();
                        }
                    } else {
                        tenants.push(profile.name);
                        mongoConnection.dropCollection("tokens", () => {
                            if (e.record) {
                                let condition = {token: e.record.token};
                                e.record._id = mongoConnection.ObjectId(e.record._id);
                                e.record = {$set: e.record};
                                mongoConnection.updateOne("tokens", condition, e.record, {'upsert': true}, (error, result) => {
                                    console.log("tokens", error);
                                    mongoConnection.closeDb();
                                    return cb();
                                });
                            } else {
                                return cb();
                            }
                        });
                    }
                },
                () => {
                    return cb();
                });
        } else
            return cb();
    },
    tenants: (dataPath, mongoConnection, cb) => {
        let records = [];
        fs.readdirSync(dataPath).forEach(function (file) {
            let rec = require(dataPath + file);
            //TODO: validate env
            records.push(rec);
        });
        if (records && Array.isArray(records) && records.length > 0) {
            mongoConnection.dropCollection("tenants", () => {
                async.each(
                    records,
                    (e, cb) => {
                        let condition = {["code"]: e["code"]};
                        e["_id"] = mongoConnection.ObjectId(e["_id"]);
                        e.applications.forEach(app => {
                            app.appId = mongoConnection.ObjectId(app.appId);
                        });
                        e = {$set: e};
                        mongoConnection.updateOne('tenants', condition, e, {'upsert': true}, (error, result) => {
                            console.log('tenants', error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        } else {
            mongoConnection.dropCollection(colName, () => {
                return cb();
            });
        }
    }
};

module.exports = (profilePath, dataPath, callback) => {
    let profile;
    //check if profile is found
    fs.stat(profilePath, (error) => {
        if (error) {
            return callback(null, 'Profile not found!');
        }

        //read  mongo profile file
        profile = require(profilePath);
        //use soajs.core.modules to create a connection to core_provision database
        let mongoConnection = new Mongo(profile);
        console.log("Importing from: " + dataPath);
        async.waterfall([
                function (cb) {
                    //check for environment data
                    if (fs.existsSync(dataPath + "environment/")) {
                        let config = {
                            "colName": "environment",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "environment/", mongoConnection, cb);
                    } else {
                        return cb(null);
                    }
                },
                function (cb) {
                    //check for environment data
                    if (fs.existsSync(dataPath + "hosts/")) {
                        let config = {
                            "colName": "hosts",
                            "condAnchor": "name",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "hosts/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for products data
                    if (fs.existsSync(dataPath + "products/")) {
                        let config = {
                            "colName": "products",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "products/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for products data
                    if (fs.existsSync(dataPath + "resources/")) {
                        let config = {
                            "colName": "resources",
                            "condAnchor": "name",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "resources/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for products data
                    if (fs.existsSync(dataPath + "services/")) {
                        let config = {
                            "colName": "services",
                            "condAnchor": "name",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "services/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for tenants data
                    if (fs.existsSync(dataPath + "tenants/")) {
                        return lib.tenants(dataPath + "tenants/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for tenants data
                    if (fs.existsSync(dataPath + "oauth/urac/")) {
                        return lib.oauth_urac(dataPath + "oauth/urac/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for tenants data
                    if (fs.existsSync(dataPath + "oauth/token/")) {
                        return lib.oauth_token(dataPath + "oauth/token/", mongoConnection, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for users data
                    if (fs.existsSync(dataPath + "urac/users/")) {
                        let clone_profile = JSON.parse(JSON.stringify(profile));
                        return lib.users(dataPath + "urac/users/", clone_profile, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    //check for groups data
                    if (fs.existsSync(dataPath + "urac/groups/")) {
                        let clone_profile = JSON.parse(JSON.stringify(profile));
                        return lib.groups(dataPath + "urac/groups/", clone_profile, cb);
                    } else
                        return cb(null);
                },
                function (cb) {
                    if (fs.existsSync(dataPath + "urac/tokens/")) {
                        let clone_profile = JSON.parse(JSON.stringify(profile));
                        return lib.tokens(dataPath + "urac/tokens/", clone_profile, cb);
                    } else
                        return cb(null);
                }

            ],
            (error) => {
                mongoConnection.closeDb();
                return callback(null, "MongoDb Soajs Data custom done!");
            });
    });
};