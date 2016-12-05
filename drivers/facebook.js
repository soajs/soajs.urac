"use strict";

var lib = {
	"init": function (req, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		var data = {
			strategy: require('passport-facebook').Strategy,
			authentication: 'facebook',
			configAuth: {
				clientID: req.soajs.servicesConfig.urac.passportLogin[mode].clientID,
				clientSecret: req.soajs.servicesConfig.urac.passportLogin[mode].clientSecret.trim(),
				callbackURL: req.soajs.servicesConfig.urac.passportLogin[mode].callbackURL,
				scope: 'email',
				profileFields: ['id', 'email', 'name']
			}
		};
		return cb(null, data);
	},
	
	"mapProfile": function (user, cb) {
		var profile = {
			firstName: user.profile._json.first_name,
			lastName: user.profile._json.last_name,
			email: user.profile._json.email,
			password: '',
			username: user.profile.id
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