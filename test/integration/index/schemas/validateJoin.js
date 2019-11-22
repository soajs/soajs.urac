/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let validateJoinSchema = {
	"type": "object",
	"required": true,
	"additionalProperties": false,
	"properties": {
		"result": {
			"type": "boolean",
			"required": true
		},
		"data": {
			"type": "object",
			"required": false,
			"properties": {
				"username": {"type": "string", "required": true},
				"email": {"type": "string", "required": true},
				"_id": {"type": "string", "required": true},
			}
		},
		"errors": {
			"type": "object",
			"required": false,
			"properties": {
				"codes": {
					"type": "array",
					"required": true
				},
				"details": {
					"type": "array",
					"required": true
				}
			}
		}
	}
};

module.exports = validateJoinSchema;

