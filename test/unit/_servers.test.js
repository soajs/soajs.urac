"use strict";

describe("Beginning test", function () {
	
	it("Testing urac", function (done) {
	require("./urac.test");
		require("./product.test");
		require("./utils.test");
		done();
	});
});