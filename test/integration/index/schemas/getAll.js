/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

"use strict";

let listAllSchema = {
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
				"users": {
					"type": "array",
					"required": true,
					"items": {
						"type": "object",
						"required": true,
						"additionalProperties": false,
						"properties": {
							"_id": {"type": "string", "required": true},
							"locked": {"type": "boolean", "required": false},
							"username": {"type": "string", "required": true},
							"firstName": {"type": "string", "required": true},
							"lastName": {"type": "string", "required": true},
							"email": {"type": "string", "required": true},
							"ts": {"type": "integer", "required": false},
							"status": {"type": "string", "required": true},
							"profile": {"type": "object", "required": false},
							"groups": {
								"type": "array",
								"required": true,
								"items": {
									"type": "string"
								}
							},
							"config": {
								"type": "object",
								"required": false,
								"additionalProperties": false,
								"properties": {
									"packages": {"type": "object", "required": false},
									"keys": {"type": "object", "required": false},
									"allowedTenants": {
										"type": "array",
										"required": false,
										"items": {
											"type": "object",
											"required": false,
											"additionalProperties": false,
											"properties": {
												"tenant": {
													"type": "object",
													"required": true,
													"additionalProperties": false,
													"properties": {
														"id": {"type": "string", "required": false},
														"code": {"type": "string", "required": false},
														"pin": {
															"allowed": {"type": "boolean", "required": false},
															"code": {"type": "string", "required": false}
														}
													}
												},
												"groups": {"type": "array", "required": true}
											}
										}
									}
								}
							},
							"tenant": {
								"type": "object",
								"required": false,
								"additionalProperties": false,
								"properties": {
									"id": {"type": "string", "required": false},
									"code": {"type": "string", "required": false},
									"pin": {
										"allowed": {"type": "boolean", "required": false},
										"code": {"type": "string", "required": false}
									}
								}
							}
						}
					}
				},
				"groups": {
					"type": "array",
					"required": false,
					"items": {
						"type": "object",
						"required": false,
						"additionalProperties": false,
						"properties": {
							"_id": {"type": "string", "required": true},
							"code": {"type": "string", "required": true},
							"name": {"type": "string", "required": true},
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
						}
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

module.exports = listAllSchema;