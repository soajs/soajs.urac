'use strict';

var utils = require('soajs/lib/').utils;

var userCollectionName = "users";
var tokenCollectionName = "tokens";
var groupsCollectionName = "groups";

function checkIfError(req, res, data, flag, cb) {
	if (data.error) {
		if (typeof (data.error) === 'object' && data.error.message) {
			req.soajs.log.error(data.error);
		}
		if (flag) {
			data.mongo.closeDb();
		}
		return res.jsonp(req.soajs.buildResponse({"code": data.code, "msg": data.config.errors[data.code]}));
	}
	else {
		return cb();
	}
}

var libProduct = {
	
	"admin": {
		"listUsers": function (config, mongo, req, res) {
			var condition = {};
			if (req.soajs.inputmaskData['tId']) {
				condition = {"tenant.id": req.soajs.inputmaskData['tId']};
			}

			var fields = {'password': 0};
			mongo.find(userCollectionName, condition, fields, function (err, userRecords) {
				mongo.closeDb();
				var data = {config: config, error: err || !userRecords, code: 406, mongo: mongo};
				checkIfError(req, res, data, false, function () {
					//if no records return empty array
					if (userRecords.length === 0) {
						return res.jsonp(req.soajs.buildResponse(null, []));
					}
					
					return res.jsonp(req.soajs.buildResponse(null, userRecords));
				});
			});
		}
	}
};

module.exports = libProduct;