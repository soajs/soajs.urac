"use strict";

var lib = {
	"init": function (req, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		var data = {
			strategy: require('passport-google-oauth').OAuth2Strategy, // OAuthStrategy, OAuth2Strategy
			authentication: 'google',
			configAuth: {
				clientID: req.soajs.servicesConfig.urac.passportLogin[mode].clientID,
				clientSecret: req.soajs.servicesConfig.urac.passportLogin[mode].clientSecret.trim(),
				callbackURL: req.soajs.servicesConfig.urac.passportLogin[mode].callbackURL,
				accessType: 'offline',
				// approvalPrompt: 'force',
				scope: 'email'
			}
		};
		return cb(null, data);
	},
	
	"mapProfile": function (user, cb) {
		var email = '';
		if (user.profile.emails && user.profile.emails.length !== 0) {
			email = user.profile.emails[0].value;
		}
		var profile = {
			firstName: user.profile.name.givenName,
			lastName: user.profile.name.familyName,
			email: email,
			password: '',
			username: user.profile.id
		};
		return cb(null, profile);
	},
	
	"preAuthenticate": function (req, cb) {
		return cb(null);
	},
	
	"updateConfig": function (config, cb) {
		config.scope = 'email';
		config.accessType = 'offline';
		
		return cb(null, config);
	}
};

module.exports = lib;