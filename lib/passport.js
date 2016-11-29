'use strict';
var fs = require("fs");

var main = {
	"getDriver": function (req, check, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		var filePath = __dirname + "/../drivers/" + mode + ".js";

		function returnDriver() {
			var driver = require(filePath);
			return cb(null, driver);
		}
		
		if (check) {
			fs.exists(filePath, function (exists) {
				if (!exists) {
					return cb({"code": 427, "msg": req.soajs.config.errors[427]});
				}
				returnDriver();
			});
		}
		else {
			returnDriver();
		}
	},
	
	"init": function (req, cb) {
		var passport = require("passport");
		var authentication = req.soajs.inputmaskData.strategy;

		main.getDriver(req, true, function (err, driver) {
			if (err) {
				return cb(err);
			}
			if (!req.soajs.servicesConfig || !req.soajs.servicesConfig.urac.passportLogin[authentication]) {
				return cb({"code": 399, "msg": req.soajs.config.errors[399]});
			}
			driver.init(req, function (error, data) {
				// now we have the strategy, configuration , and authentication method defined
				var myStrategy = new data.strategy(data.configAuth, function (accessToken, refreshToken, profile, done) {
						return done(null, {"profile": profile, "refreshToken": refreshToken, "accessToken": accessToken});
					}
				);
				passport.use(myStrategy);
				return cb(null, passport);
			});
		});
		
	},
	
	"initAuth": function (req, res, passport) {
		var authentication = req.soajs.inputmaskData.strategy;
		var config = {session: false};
		main.getDriver(req, false, function (err, driver) {
			driver.updateConfig(config, function (error, config) {
				passport.authenticate(authentication, config)(req, res);
			});
		});
	},
	
	"authenticate": function (req, res, passport, initBLModel) {
		var authentication = req.soajs.inputmaskData.strategy;
		
		main.getDriver(req, false, function (err, driver) {
			driver.preAuthenticate(req, function (error) {
				passport.authenticate(authentication, {session: false}, function (err, user, info) {
					if (err) {
						req.soajs.log.error(err);
						return res.json(req.soajs.buildResponse({"code": 499, "msg": err.toString()}));
					}
					if (!user) {
						return res.json(req.soajs.buildResponse({"code": 403, "msg": req.soajs.config.errors[403]}));
					}
					initBLModel(req, res, function (BLInstance) {
						req.soajs.inputmaskData.user = user;
						BLInstance.guest.customLogin(req.soajs, function (error, data) {
							return res.json(req.soajs.buildResponse(error, data));
						});
					});
					
				})(req, res);
				
			});
		});
		
	}
};

module.exports = main;