'use strict';
var fs = require("fs");

var main = {
	"getDriver": function (req, res, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		
		var filePath = __dirname + "/../drivers/" + mode + ".js";
		
		fs.exists(filePath, function (exists) {
			if (!exists) {
				return res.json(req.soajs.buildResponse({"code": 427, "msg": req.soajs.config.errors[427]}));
			}
			
			var driver = require(filePath);
			return cb(null, driver);
		});
	},
	
	"init": function (req, res, cb) {
		var passport = require("passport");
		var mode = req.soajs.inputmaskData.strategy;
		
		if (!req.soajs.servicesConfig || !req.soajs.servicesConfig.urac.passportLogin[mode]) {
			return res.json(req.soajs.buildResponse({"code": 399, "msg": req.soajs.config.errors[399]}));
		}
		
		main.getDriver(req, res, function (err, driver) {
			driver.init(req, function (error, data) {
				// now we have the strategy, configuration , and authentication method defined
				var myStrategy = new data.strategy(data.configAuth, function (accessToken, refreshToken, profile, done) {
						return done(null, {"profile": profile, "refreshToken": refreshToken, "accessToken": accessToken});
					}
				);
				
				passport.use(myStrategy);
				return cb(passport);
			});
		});
		
	},
	
	"initAuth": function (req, res, passport) {
		var authentication = req.soajs.inputmaskData.strategy;
		var config = {session: false};
		
		main.getDriver(req, res, function (err, driver) {
			driver.updateConfig(config, function (error, config) {
				passport.authenticate(authentication, config)(req, res);
			});
		});
	},
	
	"authenticate": function (req, res, passport, initBLModel) {
		var authentication = req.soajs.inputmaskData.strategy;
		
		main.getDriver(req, res, function (err, driver) {
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
						BLInstance.guest.customLogin(req, res);
					});
					
				})(req, res);
				
			});
		});
		
	}
};

module.exports = main;