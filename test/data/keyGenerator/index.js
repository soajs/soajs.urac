'user strict';


const soajs = require('soajs');
const core = soajs.core;

let tenant = {
	id: '5da6d6280067e20d5fe67667'
};

let application = {
	package: "TPROD_BASIC",
};

let config = {
	algorithm: "aes256",
		password: "soajs key lal massa"
};

core.key.generateInternalKey((err, uId) => {
	console.log(uId, 'internal Key');
	
	core.key.generateExternalKey(uId, tenant, application, config, (err, extKey) => {
		console.log(extKey, 'external Key');
	});
});