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
							"locked": {"type": "boolean"},
							"username": {"type": "string", "required": true},
							"firstName": {"type": "string", "required": true},
							"lastName": {"type": "string", "required": true},
							"email": {"type": "string", "required": true},
							"phone": {"type": "string"},
							"ts": {"type": "integer"},
							"lastSeen": {"type": "integer"},
							"lastLogin": {"type": "integer"},
							"status": {"type": "string", "required": true},
							"profile": {"type": "object"},
							"groups": {
								"type": "array",
								"required": true,
								"items": {
									"type": "string"
								}
							},
							"config": {
								"type": "object",
								"additionalProperties": false,
								"properties": {
									"packages": {"type": "object"},
									"keys": {"type": "object"},
									"allowedTenants": {
										"type": "array",
										"items": {
											"type": "object",
											"additionalProperties": false,
											"properties": {
												"tenant": {
													"type": "object",
													"required": true,
													"additionalProperties": false,
													"properties": {
														"id": {"type": "string"},
														"code": {"type": "string"},
														"pin": {
															"allowed": {"type": "boolean"},
															"code": {"type": "string"}
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
								"additionalProperties": false,
								"properties": {
									"id": {"type": "string"},
									"code": {"type": "string"},
									"pin": {
										"allowed": {"type": "boolean"},
										"code": {"type": "string"}
									}
								}
							}
						}
					}
				},
				"groups": {
					"type": "array",
					"items": {
						"type": "object",
						"additionalProperties": false,
						"properties": {
							"_id": {"type": "string", "required": true},
							"code": {"type": "string", "required": true},
                            "locked": {"type": "boolean"},
							"name": {"type": "string", "required": true},
							"description": {"type": "string"},
							"config": {
								"type": "object",
								"required": true,
								"additionalProperties": false,
								"properties": {
									"allowedPackages": {
										"type": "object",
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
								"additionalProperties": true,
								"properties": {
									"id": {"type": "string", "required": true},
									"code": {"type": "string", "required": true},
									"pin": {
										"type": "object",
										"additionalProperties": false,
										"properties": {
											"code": {"type": "string"},
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