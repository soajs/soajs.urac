"use strict";
var assert = require('assert');
var helper = require("../helper.js");
var hasher = new (helper.requireModule('hasher'))({
	hashIterations: 1024,
	seedLength: 32
});

describe("testing hasher", function(){
	var plain = 'iamaphrase';
	var cypher;

	it("testing hashAsync", function(done){
		hasher.hashAsync(plain, function(error, response){
			assert.ifError(error);
			assert.ok(response);
			cypher = response;
			done();
		});
	});

	it("testing hashSync", function(done){
		var cypher2 = hasher.hashSync(plain);
		assert.ok(cypher2);
		done();
	});

	it("testing compare", function(done){
		hasher.compare(plain, cypher, function(error, response){
			assert.ifError(error);
			assert.ok(response);
			assert.equal(response, true);
			done();
		});
	});
});