"use strict";
var shell = require('shelljs');
var assert = require('assert');
var helper = require("../helper.js");
var sampleData = require("soajs.mongodb.data/modules/urac");
var urac, controller;

var soajs = require('soajs');

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var uracConfig = dbConfig();
uracConfig.name = "core_provision";
var mongo = new Mongo(uracConfig);

describe("importing sample data", function () {
	
	it("do import", function (done) {
		shell.pushd(sampleData.dir);
		shell.exec("chmod +x " + sampleData.shell, function (code) {
			assert.equal(code, 0);
			shell.exec(sampleData.shell, function (code) {
				assert.equal(code, 0);
				shell.popd();
				done();
			});
		});
	});
	
	it("clear", function (done) {
		mongo.update('tenants', { code: 'DBTN' }, {
			'$set': {
				locked: false
			}
		}, function () {
			mongo.update('tenants', { code: 'test' }, { '$set': { locked: true } }, function () {
				done();
			});
		});
	});
	
	after(function (done) {
		console.log('test data imported.');
		controller = require("soajs.controller");
		setTimeout(function () {
			urac = helper.requireModule('./index');
			setTimeout(function () {
				require("./urac.passport.test.js");
				require("./urac.grps.test.js");
				require("./urac.test.js");
				require("./urac.product.js");
				//require("./urac.test.owner.js");
				done();
			}, 1500);
		}, 1000);
	});
});