'user strict';


const soajs = require('soajs');
const core = soajs.core;

let tenant = {
	id: '5c0e74ba9acc3c5a84a51259'
};

let application = {
	package: "DSBRD_GUEST",
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