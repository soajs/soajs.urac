'use strict';
var soajs = require('soajs');
var Mongo = soajs.mongo;

var config = require('./config.js');
var service = new soajs.server.service(config);

var uracService = require('./lib/urac.js');

service.init(function () {
	
	service.post("/login", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.login(config, mongo, req, res);
	});
	
	service.get("/logout", function (req, res) {
		req.soajs.session.clearURAC(function () {
			return res.jsonp(req.soajs.buildResponse(null, true));
		});
	});
	
	service.get("/forgotPassword", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.forgotPassword(config, mongo, req, res);
	});
	
	service.post("/resetPassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.resetPassword(config, mongo, req, res);
	});
	
	service.get("/checkUsername", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.checkUsername(config, mongo, req, res);
	});
	
	service.post("/join", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.join(config, mongo, req, res);
	});
	
	service.get("/join/validate", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.joinValidate(config, mongo, req, res);
	});
	
	service.get("/changeEmail/validate", function (req, res) {
		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.guest.changeEmailValidate(config, mongo, req, res);
	});
	
	service.get("/account/getUser", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.account.getUser(config, mongo, req, res);
	});
	
	service.post("/account/changePassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.account.changePassword(config, mongo, req, res);
	});
	
	service.post("/account/changeEmail", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.account.changeEmail(config, mongo, req, res);
	});
	
	service.post("/account/editProfile", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.account.editProfile(config, mongo, req, res);
	});
	
	service.get("/admin/listUsers", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.listUsers(config, mongo, req, res);
	});
	
	service.get("/admin/users/count", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.countUsers(config, mongo, req, res);
	});
	
	service.get("/admin/getUser", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.getUser(config, mongo, req, res);
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
		
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.addUser(config, mongo, req, res);
	});
	
	service.get("/admin/changeUserStatus", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.changeStatus(config, mongo, req, res);
	});
	
	service.post("/admin/editUser", function (req, res) {
		if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
				return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
			}
		}
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.editUser(config, mongo, req, res);
	});
	
	service.post("/admin/editUserConfig", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.user.editConfig(config, mongo, req, res);
	});
	
	service.get("/admin/group/list", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.group.list(config, mongo, req, res);
	});
	
	service.post("/admin/group/add", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.group.add(config, mongo, req, res);
	});
	
	service.post("/admin/group/edit", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.group.edit(config, mongo, req, res);
	});
	
	service.get("/admin/group/delete", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.group.delete(config, mongo, req, res);
	});
	
	// add multiple Users To Group
	service.post("/admin/group/addUsers", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.group.addUsers(config, mongo, req, res);
	});
	
	service.get("/admin/all", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		uracService.admin.listAll(config, mongo, req, res);
	});
	
	service.get("/owner/admin/listUsers", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.listUsers(config, mongo, req, res);
	});
	
	service.get("/owner/admin/users/count", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.countUsers(config, mongo, req, res);
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
		
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.addUser(config, mongo, req, res);
	});

	service.post("/owner/admin/editUser", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.editUser(config, mongo, req, res);
	});
	
	service.post("/owner/admin/editUserConfig", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.editConfig(config, mongo, req, res);
	});
	
	service.get("/owner/admin/getUser", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.getUser(config, mongo, req, res);
	});

	service.get("/owner/admin/changeUserStatus", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.user.changeStatus(config, mongo, req, res);
	});

	service.get("/owner/admin/group/list", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.group.list(config, mongo, req, res);
	});
	
	service.post("/owner/admin/group/add", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.group.add(config, mongo, req, res);
	});
	
	service.post("/owner/admin/group/edit", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.group.edit(config, mongo, req, res);
	});
	
	service.get("/owner/admin/group/delete", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.group.delete(config, mongo, req, res);
	});
	
	service.post("/owner/admin/group/addUsers", function (req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.inputmaskData.tCode));
		uracService.admin.group.addUsers(config, mongo, req, res);
	});
	
	service.start();
});