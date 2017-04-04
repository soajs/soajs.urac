'use strict';

function startServer(serverConfig, callback) {
	
	var host = serverConfig.host;
	var port = serverConfig.port;
	var baseDN = serverConfig.baseDN;
	var adminUser = serverConfig.adminUser;
	var adminPassword = serverConfig.adminPassword;
	
	var userExample = {
		userName: 'owner',
		userPass: 'password',
		userCn: 'Etienne Daher',
		userSn: 'Daher',
		userMail: 'etienneadaher@gmail.com'
	};
	
	var userName = userExample.userName;
	var userPass = userExample.userPass;
	var userCn = userExample.userCn;
	var userSn = userExample.userSn;
	var userMail = userExample.userMail;
	
	var ldap = require('ldapjs');
	
	var server = ldap.createServer();
	
	server.bind('ou=system', function (req, res, next) {
		if (req.dn.toString() !== adminUser) {
			var error = {
				message: 'Incorrect DN given : invalid admin user'
			};
			return next(error);
		}
		res.end();
		return next();
	});
	
	server.bind(adminUser, function (req, res, next) {
		// console.log('Admin authentication reached ...' + req.dn.toString());
		if (req.dn.toString().replace(new RegExp(' ', 'g'), '') !== adminUser.replace(new RegExp(' ', 'g'), '') || req.credentials !== adminPassword) {
			var error = {
				message: 'INVALID_CREDENTIALS for admin ' + req.dn.toString().replace(new RegExp(' ', 'g'), '')
			};
			return next(error);
			// return next(new ldap.InvalidCredentialsError());
		}
		res.end();
		return next();
	});
	
	server.bind(baseDN, function (req, res, next) {
		// console.log('User authentication reached ...');
		if (req.dn.toString() !== 'uid=' + userName + ', ou=users, ou=system' || req.credentials !== userPass) {
			var error = {
				message: 'INVALID_CREDENTIALS for user ' + req.dn.toString()
			};
			return next(error);
			
		} else {
			res.end();
			return next();
		}
	});
	
	server.search(baseDN, function (req, res, next) {
		// console.log('User search reached ...');
		if (req.filter.toString() === '(uid=' + userName + ')') {
			var obj = {
				dn: 'uid=' + userName + ', ou=users, ou=system',  // string, not DN object
				attributes: {
					cn: [userCn],
					sn: [userSn],
					mail: [userMail],
					objectclass: ['person', 'top']
				}
			};
			res.send(obj);
		}
		
		res.end();
	});
	
	server.listen(port, host, function () {
		console.log('LDAP server listening at', server.url);
		return callback(server);
	});
	
}

function killServer(server) {
	console.log("killing server ....");
	server.close();
}

module.exports = {
	startServer: startServer,
	killServer: killServer
};