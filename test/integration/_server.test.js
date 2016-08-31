"use strict";
var shell = require('shelljs');
var assert = require('assert');
var helper = require("../helper.js");
var sampleData = require("soajs.mongodb.data/modules/urac");
var urac, controller;

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
	
	after(function (done) {
		console.log('test data imported.');
		controller = require("soajs.controller");
		setTimeout(function () {
			urac = helper.requireModule('./index');
			setTimeout(function () {
				//require("./db.config.test.js");
				require("./urac.grps.test.js");
				require("./urac.test.js");
				require("./urac.test.owner.js");
				done();
			}, 1500);
		}, 1000);
	});
});