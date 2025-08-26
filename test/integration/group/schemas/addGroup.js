/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let addGroupSchema = {
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
            "additionalProperties": false,
            "properties": {
                "_id": {"type": "string", "required": true},
                "code": {"type": "string", "required": true},
                "name": {"type": "string", "required": true},
                "ts": {"type": "integer", "required": false},
                "description": {"type": "string", "required": false},
                "config": {
                    "type": "object",
                    "required": true,
                    "additionalProperties": false,
                    "properties": {
	                    "allowedPackages": {
		                    "type": "object",
		                    "required": false,
		                    "patternProperties": {
			                    "^[a-zA-Z0-9]+$": {
				                    "type": "array",
				                    "items": {
					                    "type": "string"
				                    }
			                    }
		                    }
	                    },
	                    "allowedEnvironments": {
		                    "type": "object",
		                    "required": false,
		                    "patternProperties": {
			                    "^[a-zA-Z0-9]+$": {
				                    "type": "object"
			                    }
		                    }
	                    }
                    }
                },
                "tenant": {
                    "type": "object",
                    "required": false,
                    "additionalProperties": true,
                    "properties": {
                        "id": {"type": "string", "required": true},
                        "code": {"type": "string", "required": true},
                        "pin": {
                            "type": "object",
                            "required": false,
                            "additionalProperties": false,
                            "properties": {
                                "code": {"type": "string", "required": false},
                                "allowed": {"type": "boolean", "required": true}
                            }
                        }
                    }
                }
                /*
                { code: 'FFFF',
  name: 'integration',
  description: 'integration description',
  tenant: { id: '5d9321f8b40e09438afbd0c9', code: 'test' },
  config:
   { allowedEnvironments: { DEV: {}, TEST: {} },
     allowedPackages: { client: [Array] } },
  _id: '5d975590397e3419b784ac08' }
                 */
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

module.exports = addGroupSchema;