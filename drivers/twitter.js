"use strict";

var lib = {
	"init": function (req, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		var userProfileURL = "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true";
		if (req.soajs.servicesConfig.urac.passportLogin[mode].userProfileURL) {
			userProfileURL = req.soajs.servicesConfig.urac.passportLogin[mode].userProfileURL;
		}
		var data = {
			strategy: require('passport-twitter').Strategy,
			authentication: 'twitter',
			configAuth: {
				consumerKey: req.soajs.servicesConfig.urac.passportLogin[mode].clientID,
				consumerSecret: req.soajs.servicesConfig.urac.passportLogin[mode].clientSecret.trim(),
				callbackURL: req.soajs.servicesConfig.urac.passportLogin[mode].callbackURL,
				userProfileURL: userProfileURL,
				includeEmail: true
			}
		};
		return cb(null, data);
	},
	
	"mapProfile": function (user, cb) {
		var profile = {
			firstName: user.profile.displayName,
			lastName: '',
			email: user.profile.username + '@twitter.com',
			password: '',
			username: user.profile.username + '_' + user.profile.id
		};
		return cb(null, profile);
	},
	
	"preAuthenticate": function (req, cb) {
		if (req.soajs.inputmaskData.oauth_token && req.soajs.inputmaskData.oauth_verifier) {
			var oauth_token = req.soajs.inputmaskData.oauth_token;
			var oauth_verifier = req.soajs.inputmaskData.oauth_verifier;
			// save in request
			req.session['oauth:twitter'] = {
				'oauth_token': oauth_token,
				'oauth_token_secret': oauth_verifier
			};
		}
		else {
			req.soajs.log.error('Missing query params');
		}
		return cb(null);
	},
	
	"updateConfig": function (config, cb) {
		return cb(null, config);
	}
};

module.exports = lib;