'use strict';

var main = {
	"init": function (req, res, cb) {
		var passport = require("passport");
		var mode = req.soajs.inputmaskData.strategy;
		var clientID, clientSecret, callbackURL;
		var configAuth, strategy, authentication;
		
		if (req.soajs.servicesConfig && req.soajs.servicesConfig.urac.passportLogin[mode]) {
			clientID = req.soajs.servicesConfig.urac.passportLogin[mode].clientID;
			clientSecret = req.soajs.servicesConfig.urac.passportLogin[mode].clientSecret.trim();
			callbackURL = req.soajs.servicesConfig.urac.passportLogin[mode].callbackURL;
		}
		else {
			return res.json(req.soajs.buildResponse({"code": 399, "msg": req.soajs.config.errors[399]}));
		}
		switch (mode) {
			case 'facebook':
				strategy = require('passport-facebook').Strategy;
				authentication = 'facebook';
				configAuth = {
					clientID: clientID,
					clientSecret: clientSecret,
					callbackURL: callbackURL,
					scope: 'email',
					profileFields: ['id', 'email', 'name']
				};
				break;
			case 'google':
				configAuth = {
					clientID: clientID,
					clientSecret: clientSecret,
					callbackURL: callbackURL,
					accessType: 'offline',
					// approvalPrompt: 'force',
					scope: 'email'
				};
				strategy = require('passport-google-oauth').OAuth2Strategy; // OAuthStrategy, OAuth2Strategy
				authentication = 'google';
				break;
			case 'twitter':
				var userProfileURL = "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true";
				if (req.soajs.servicesConfig.urac.passportLogin[mode].userProfileURL) {
					userProfileURL = req.soajs.servicesConfig.urac.passportLogin[mode].userProfileURL;
				}
				configAuth = {
					consumerKey: clientID,
					consumerSecret: clientSecret,
					callbackURL: callbackURL,
					userProfileURL: userProfileURL,
					includeEmail: true
				};
				strategy = require('passport-twitter').Strategy;
				authentication = 'twitter';
				break;
			case 'github':
				strategy = require('passport-github').Strategy;
				authentication = 'github';
				configAuth = {
					clientID: clientID,
					clientSecret: clientSecret,
					callbackURL: callbackURL
				};
				break;
			default:
				break;
		}
		
		// try {
		// now we have the strategy, configuration , and authentication method defined
		var myStrategy = new strategy(configAuth, function (accessToken, refreshToken, profile, done) {
				return done(null, {"profile": profile, "refreshToken": refreshToken, "accessToken": accessToken});
			}
		);
		// }
		// catch (e) {
		// 	req.soajs.log.error(e);
		// 	return res.json(req.soajs.buildResponse({"code": 400, "msg": e.message}));
		// }
		passport.use(myStrategy);
		return cb(passport);
	},
	
	"initAuth": function (req, res, passport) {
		var authentication = req.soajs.inputmaskData.strategy;
		
		var config = {session: false};
		if (authentication === 'google') {
			config.scope = 'email';
			config.accessType = 'offline';
		}
		
		passport.authenticate(authentication, config)(req, res);
	},
	
	"authenticate": function (req, res, passport, initBLModel) {
		var authentication = req.soajs.inputmaskData.strategy;
		if (authentication === 'twitter') {
			if (req.soajs.inputmaskData.oauth_token && req.soajs.inputmaskData.oauth_verifier) {
				var oauth_token = req.soajs.inputmaskData.oauth_token;
				var oauth_verifier = req.soajs.inputmaskData.oauth_verifier;
			}
			else {
				req.soajs.log.error('Missing query params');
			}
			// save in request
			req.session['oauth:twitter'] = {
				'oauth_token': oauth_token,
				'oauth_token_secret': oauth_verifier
			};
		}
		
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
	}
};

module.exports = main;