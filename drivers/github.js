"use strict";

var lib = {
	"init": function (req, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		var data = {
			strategy: require('passport-github').Strategy,
			authentication: 'github',
			configAuth: {
				clientID: req.soajs.servicesConfig.urac.passportLogin[mode].clientID,
				clientSecret: req.soajs.servicesConfig.urac.passportLogin[mode].clientSecret.trim(),
				callbackURL: req.soajs.servicesConfig.urac.passportLogin[mode].callbackURL
			}
		};
		
		return cb(null, data);
	},
	
	"mapProfile": function (user, cb) {
		var profile = {
			firstName: user.profile.username,
			lastName: '',
			email: user.profile.username + '@github.com',
			password: '',
			username: user.profile.username + '_' + user.profile.id
		};
		
		return cb(null, profile);
	},
	
	"preAuthenticate": function (req, cb) {
		return cb(null);
	},
	
	"updateConfig": function (config, cb) {
		return cb(null, config);
	}
};

module.exports = lib;