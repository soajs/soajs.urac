'use strict';
var soajs = require('soajs');
var config = require('./config.js');
var service = new soajs.server.service(config);

var BLModule = require('./lib/urac.js');

function initBLModel(req, res, cb) {
	var modelName = req.soajs.servicesConfig.model || config.model;
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
			BLInstance.guest.login(req, res);
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
			BLInstance.guest.forgotPassword(req, res);
		});
	});
	
	service.post("/resetPassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.resetPassword(req, res);
		});
	});
	
	service.get("/checkUsername", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.checkUsername(req, res);
		});
	});
	
	service.post("/join", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.join(req, res);
		});
	});
	
	service.get("/join/validate", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.joinValidate(req, res);
		});
	});
	
	service.get("/changeEmail/validate", function (req, res) {
		//check if user account is there
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.changeEmailValidate(req, res);
		});
	});
	
	service.get("/account/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.getUser(req, res);
		});
	});
	
	service.post("/account/changePassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changePassword(req, res);
		});
	});
	
	service.post("/account/changeEmail", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changeEmail(req, res);
		});
	});
	
	service.post("/account/editProfile", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.editProfile(req, res);
		});
	});
	
	service.get("/admin/listUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsers(req, res);
		});
	});
	
	service.get("/admin/users/count", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.countUsers(req, res);
		});
	});
	
	service.get("/admin/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.getUser(req, res);
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
			BLInstance.admin.user.addUser(req, res);
		});
	});
	
	service.get("/admin/changeUserStatus", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.changeStatus(req, res);
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
			BLInstance.admin.user.editUser(req, res);
		});
	});
	
	service.post("/admin/editUserConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editConfig(req, res);
		});
	});
	
	service.get("/admin/group/list", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.list(req, res);
		});
	});
	
	service.post("/admin/group/add", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.add(req, res);
		});
	});
	
	service.post("/admin/group/edit", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.edit(req, res);
		});
	});
	
	service.get("/admin/group/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.delete(req, res);
		});
	});
	
	// add multiple Users To Group
	service.post("/admin/group/addUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addUsers(req, res);
		});
	});
	
	service.get("/admin/all", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.listAll(req, res);
		});
	});
	
	service.get("/owner/admin/listUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsers(req, res);
		});
	});
	
	service.get("/owner/admin/users/count", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.countUsers(req, res);
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
			BLInstance.admin.user.addUser(req, res);
		});
	});
	
	service.post("/owner/admin/editUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editUser(req, res);
		});
	});
	
	service.post("/owner/admin/editUserConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editConfig(req, res);
		});
	});
	
	service.get("/owner/admin/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.getUser(req, res);
		});
	});
	
	service.get("/owner/admin/changeUserStatus", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.changeStatus(req, res);
		});
	});
	
	service.get("/owner/admin/group/list", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.list(req, res);
		});
	});
	
	service.post("/owner/admin/group/add", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.add(req, res);
		});
	});
	
	service.post("/owner/admin/group/edit", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.edit(req, res);
		});
	});
	
	service.get("/owner/admin/group/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.delete(req, res);
		});
	});
	
	service.post("/owner/admin/group/addUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addUsers(req, res);
		});
	});
	
	service.start();
});