/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let uninviteUsersSchema = {
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
				"succeeded": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"id": {"type": "string"},
							"email": {"type": "string"},
							"username": {"type": "string"},
						},
						"oneOf": [
							{"required": ["id"]},
							{"required": ["username"]},
							{"required": ["email"]}
						]
					}
				},
				"failed": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"reason": {"type": "string", "required": true},
							"id": {"type": "string"},
							"email": {"type": "string"},
							"username": {"type": "string"},
						},
						"oneOf": [
							{"required": ["reason"]}
						]
					}
				}
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

module.exports = uninviteUsersSchema;

