'use strict';
var soajs = require('soajs');
var config = require('./config.js');
var service = new soajs.server.service(config);
var uracDriver = require("soajs.urac.driver");

var BLModule = require('./lib/urac.js');

function initBLModel(req, res, cb) {
	var modelName = config.model;
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.model) {
		modelName = req.soajs.servicesConfig.model
	}
	if (process.env.SOAJS_TEST && req.soajs.inputmaskData.model) {
		modelName = req.soajs.inputmaskData.model;
	}
	BLModule.init(modelName, function (error, BL) {
		if (error) {
			req.soajs.log.error(error);
			return res.json(req.soajs.buildResponse({"code": 601, "msg": config.errors[601]}));
		}
		else {
			return cb(BL);
		}
	});
}

service.init(function () {
	
	service.post("/login", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.login(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post('/ldap/login', function (req, res) {
		var data = {
			'username': req.soajs.inputmaskData['username'],
			'password': req.soajs.inputmaskData['password']
		};
		
		req.soajs.config = config;
		uracDriver.ldapLogin(req.soajs, data, function (error, data) {
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	service.get("/logout", function (req, res) {
		req.soajs.session.clearURAC(function () {
			return res.jsonp(req.soajs.buildResponse(null, true));
		});
	});
	
	service.get("/forgotPassword", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.forgotPassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/resetPassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.resetPassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/checkUsername", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.checkUsername(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/join", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.join(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/join/validate", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.joinValidate(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/changeEmail/validate", function (req, res) {
		//check if user account is there
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.changeEmailValidate(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/account/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.getUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/account/changePassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changePassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/account/changeEmail", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changeEmail(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/account/editProfile", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.editProfile(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/listUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/users/count", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.countUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.getUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/admin/addUser", function (req, res) {
		
		if (req.soajs.inputmaskData['status'] === 'pendingNew' && req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
		}
		
		if (req.soajs.inputmaskData['status'] !== 'pendingNew' && (!req.soajs.inputmaskData['password'] || req.soajs.inputmaskData['password'] === '')) {
			return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
		}
		
		if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
				return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
			}
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.addUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/changeUserStatus", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.changeStatus(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/admin/editUser", function (req, res) {
		if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
				return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
			}
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/admin/editUserConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editConfig(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/group/list", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.list(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/admin/group/add", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.add(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/admin/group/edit", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.edit(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.delete("/admin/group/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.delete(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	// add multiple Users To Group
	service.post("/admin/group/addUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/admin/all", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.listAll(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/listUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/users/count", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.countUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/addUser", function (req, res) {
		if (req.soajs.inputmaskData['status'] !== 'pendingNew') {
			if (!req.soajs.inputmaskData['password'] || req.soajs.inputmaskData['password'] === '') {
				return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
			}
		}
		else if (req.soajs.inputmaskData['status'] === 'pendingNew') {
			if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
				return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
			}
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.addUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/editUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/editUserConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editConfig(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.getUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/changeUserStatus", function (req, res) {
		req.soajs.config = config;
		initBLModel(req, res, function (BLInstance) {
			BLInstance.admin.user.changeStatus(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/group/list", function (req, res) {
		req.soajs.config = config;
		initBLModel(req, res, function (BLInstance) {
			BLInstance.admin.group.list(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/group/add", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.add(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/group/edit", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.edit(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.delete("/owner/admin/group/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.delete(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.post("/owner/admin/group/addUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get("/owner/admin/tokens/list", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.tokens.list(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.delete("/owner/admin/tokens/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.tokens.delete(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	service.get('/passport/login/:strategy', function (req, res) {
		req.soajs.config = config;
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return res.json(req.soajs.buildResponse(error));
			}
			uracDriver.passportLibInitAuth(req, res, passport);
		});
	});
	
	service.get('/passport/validate/:strategy', function (req, res) {
		req.soajs.config = config;
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return res.json(req.soajs.buildResponse(error));
			}
			uracDriver.passportLibAuthenticate(req, res, passport, function (error, user) {
				if (error) {
					return res.json(req.soajs.buildResponse(error, null));
				}
				
				initBLModel(req, res, function (BLInstance) {
					BLInstance.guest.customLogin(req, user, function (error, data) {
						return res.json(req.soajs.buildResponse(error, data));
					});
				});
				
			});
		});
	});
	
	service.start();
});