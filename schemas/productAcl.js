"use strict";
let accessSchema = {
	"oneOf": [
		{"type": "boolean", "required": false},
		{"type": "array", "minItems": 1, "items": {"type": "string", "required": true}, "required": false}
	]
};

let apisObject = {
	"type": "object",
	"required": false,
	"patternProperties": {
		"^[_a-z\/][_a-zA-Z0-9\/:]*$": { //pattern to match an api route
			"type": "object",
			"required": true,
			"properties": {
				"access": accessSchema
			},
			"additionalProperties": false
		}
	}
};

let aclMethod = {
	"type": "object",
	"required": false,
	"properties": {
		"apis": apisObject
	}
};

let acl = {
	'source': ['body.acl'],
	'required': false,
	'validation': {
		"type": "object",
		"patternProperties": {
			"^[a-zA-Z0-9]{4}$": {
				"type": "object",
				"additionalProperties": {
					"type": "object",
					"required": false,
					"properties": {
						"access": accessSchema,
						"apisPermission": {
							"type": "string", "enum": ["restricted"], "required": false
						},
						"apis": apisObject,
						"get": aclMethod,
						"post": aclMethod,
						"put": aclMethod,
						"delete": aclMethod,
						"apisRegExp": {
							"type": "array",
							"required": false,
							"minItems": 1,
							"items": {
								"type": "object",
								"properties": {
									"regExp": {"type": "pattern", required: true, "pattern": /\.+/},
									"access": accessSchema
								},
								"additionalProperties": false
							}
						}
					},
					"additionalProperties": false
				}
			}
		}
	}
};

module.exports = acl;