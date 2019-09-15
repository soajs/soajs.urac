'use strict';

let env = {
    "_id": '5ca223b3b77f8d203a646ca8',
    "code": "STG",
    "domain": null,
    "sitePrefix": null,
    "apiPrefix": "api",
    "locked": true,
    "port": null,
	"protocol": "http",
    "deployer": {
	    "type": "manual",
	    "selected": "manual",
	    "manual": {
	    	"nodes": "127.0.0.1",
	    },
	    "container": {
		    "docker": {
			    "local": {
				    "nodes": "",
				    "socketPath": "/var/run/docker.sock",
			    },
			    "remote": {
				    "apiPort": "",
				    "nodes": "",
				    "apiProtocol": "",
				    "auth": {
					    "token": ""
				    }
			    }
		    },
		    "kubernetes":{
			    "local":{
				    "nodes": "",
				    "apiPort": "",
				    "namespace": "",
                    "auth": {
				        "token": ""
                    }
			    },
			    "remote":{
				    "nodes": "",
				    "apiPort": "",
				    "namespace": "",
                    "auth": {
                        "token": ""
                    }
			    }
		    }
	    }
    },
    "description": "SOAJS Console Environment",
    "dbs": {
        "config": {
            "prefix": ""
        },
	    "session": {
		    "cluster": "dash_cluster",
		    "tenantSpecific": false,
		    "name": "core_session",
		    'store': {},
		    "collection": "sessions",
		    'stringify': false,
		    'expireAfter': 1000 * 60 * 60 * 24 * 14 // 2 weeks
	    },
        "databases": {
            "urac": {
                "cluster": "dash_cluster",
                "tenantSpecific": true
            }
        }
    },
    "services": {
        "controller": {
            "maxPoolSize": 100,
            "authorization": true,
            "requestTimeout": 30,
            "requestTimeoutRenewal": 0
        },
        "config": {
            "awareness": {
                "cacheTTL": 1000 * 60 * 60, // 1 hr
                "healthCheckInterval": 1000 * 5, // 5 seconds
                "autoRelaodRegistry": 1000 * 60 * 60, // 1 hr
                "maxLogCount": 5,
                "autoRegisterService": true
            },
            "agent": {
                "topologyDir": "/opt/tmp/soajs/"
            },
            "key": {
                "algorithm": 'aes256',
                "password": 'soajs key lal massa'
            },
            "logger": {
                "src": true,
                "level": "debug",
                "formatter": {
	                "levelInString": true,
	                "outputMode": 'long'
                }
            },
            "cors": {
                "enabled": true,
                "origin": '*',
                "credentials": 'true',
                "methods": 'GET,HEAD,PUT,PATCH,POST,DELETE',
                "headers": 'key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
                "maxage": 1728000
            },
            "oauth": {
                "grants": ['password', 'refresh_token'],
                "debug": false,
	            "accessTokenLifetime": 7200,
	            "refreshTokenLifetime": 1209600
            },
            "ports": {
	            "controller": 4000,
	            "maintenanceInc": 1000,
	            "randomInc": 100
            },
            "cookie": {
	            "secret": "this is a secret sentence"
            },
            "session": {
                "name": "soajsID",
                "secret": "this is antoine hage app server",
                "cookie": {
                    "path": '/',
                    "httpOnly": true,
                    "secure": false,
                    "maxAge": null
                },
                "resave": false,
                "saveUninitialized": false,
                "rolling": false,
                "unset": "keep"
            }
        }
    }
};

module.exports = env;