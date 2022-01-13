'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */


module.exports = (soajs, body, error, cb) => {
	if (error && error.message) {
		soajs.log.error(error.message);
	} else if (body && (!body.result || body.errors)) {
		soajs.log.error(body.errors);
		if (body.errors.details[0].message) {
			error = new Error(body.errors.details[0].message);
		}
	}
	if (body && body.result && body.data) {
		return cb(error, body.data);
	} else {
		return cb(error, null);
	}
};
