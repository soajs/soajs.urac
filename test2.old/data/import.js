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
                        mongoConnection.update(colName, condition, e, {'upsert': true}, (error, result) => {
                            console.log(colName, error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        }
        else
            return cb();
    },
    oauth: (dataPath, mongoConnection, cb) => {
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
                        mongoConnection.update("oauth_token", condition, e, {'upsert': true}, (error, result) => {
                            console.log("oauth_token", error);
                            return cb();
                        });
                    },
                    () => {
                        return cb();
                    });
            });
        }
        else
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
            async.each(
                records,
                (e, cb) => {
                    profile.name = e.tenant.code + "_urac";
                    let mongoConnection = new Mongo(profile);
                    mongoConnection.dropCollection("users", () => {
                        let condition = {email: e.email};
                        e._id = mongoConnection.ObjectId(e._id);
                        mongoConnection.update("users", condition, e, {'upsert': true}, (error, result) => {
                            console.log("users", error);
                            mongoConnection.closeDb();
                            return cb();
                        });
                    });
                },
                () => {
                    return cb();
                });
        }
        else
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
            async.each(
                records,
                (e, cb) => {
                    profile.name = e.tenant.code + "_urac";
                    let mongoConnection = new Mongo(profile);
                    mongoConnection.dropCollection("groups", () => {
                        let condition = {code: e.code};
                        e._id = mongoConnection.ObjectId(e._id);
                        mongoConnection.update("groups", condition, e, {'upsert': true}, (error, result) => {
                            console.log("groups", error);
                            mongoConnection.closeDb();
                            return cb();
                        });
                    });
                },
                () => {
                    return cb();
                });
        }
        else
            return cb();
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
        async.series([
                function (cb) {
                    //check for environment data
                    if (fs.existsSync(dataPath + "environment/")) {
                        let config = {
                            "colName": "environment",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "environment/", mongoConnection, cb);
                        //return lib.environment(dataPath + "environment/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
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
                        //return lib.hosts(dataPath + "hosts/", mongoConnection, cb);
                    }
                    else
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
                        //return lib.product(dataPath + "products/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for products data
                    if (fs.existsSync(dataPath + "resources/")) {
                        let config = {
                            "colName": "resources",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "resources/", mongoConnection, cb);
                        //return lib.resources(dataPath + "resources/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for products data
                    if (fs.existsSync(dataPath + "services/")) {
                        let config = {
                            "colName": "services",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "services/", mongoConnection, cb);
                        //return lib.services(dataPath + "services/", mongoConnection, cb);
                    }
                    else
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
                        //return lib.product(dataPath + "products/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for tenants data
                    if (fs.existsSync(dataPath + "tenants/")) {
                        let config = {
                            "colName": "tenants",
                            "condAnchor": "code",
                            "objId": "_id"
                        };
                        return lib.basic(config, dataPath + "tenants/", mongoConnection, cb);
                        //return lib.tenant(dataPath + "tenants/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for tenants data
                    if (fs.existsSync(dataPath + "oauth/")) {
                        return lib.oauth(dataPath + "oauth/", mongoConnection, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for users data
                    if (fs.existsSync(dataPath + "urac/users/")) {
                        return lib.users(dataPath + "urac/users/", profile, cb);
                    }
                    else
                        return cb(null);
                },
                function (cb) {
                    //check for groups data
                    if (fs.existsSync(dataPath + "urac/groups/")) {
                        return lib.groups(dataPath + "urac/groups/", profile, cb);
                    }
                    else
                        return cb(null);
                }
            ],
            () => {
                mongoConnection.closeDb();
                return callback(null, "MongoDb Soajs Data custom done!");
            });
    });
};