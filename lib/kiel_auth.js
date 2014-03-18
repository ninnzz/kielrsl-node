var kiel = {}
	, db = require(__dirname + "/../helpers/ndb")
	, listener
	, https = require("https")
	, http = require("http")
	, user_includes = require(__dirname + "/../config/user_includes");



	/**
	 *	Sets the inlucde of each users
	 *	defined in config/user_includes and makes it a globa variable
	 *
	 */
	for(var include in user_includes){
		if(user_includes[include]){
			kiel[include] = user_includes[include];
		}
	}

	/**
	 *	Basic require needed for the app
	 *
	 */

	kiel.qs = require("querystring");
	kiel.fs = require("fs");
	kiel.url = require("url");
	kiel.global_config = require(__dirname + "/../config/global_config");		//call data handler depending on config
	kiel.application_config = require(__dirname + "/../config/application");	//call data handler depending on config
	kiel.controller_cache = {}													//for custom cache, check if the controller is updated

	kiel.logger 	= require("./logger")(kiel.fs,kiel.global_config);
	kiel.response 	= require("./response")(kiel.application_config,require("util"));
	kiel.utils	 	= require(__dirname + "/../helpers/utils");


	listener 		= require("./listener")(kiel);
	

	if(kiel.application_config.is_https){
		/**
		 *	Options for supporting https
		 *	Declares SSL file configurations
		 *
		 */
		var  options = {
	  		key: kiel.fs.readFileSync(__dirname + kiel.application_config.ssl_server_key),
			cert: kiel.fs.readFileSync(__dirname + kiel.application_config.ssl_server_cert),
			ca: kiel.fs.readFileSync(__dirname + kiel.application_config.ssl_ca_cert),
			requestCert: true,
			rejectUnauthorized: false
		};
		https.createServer(options,listener).listen(kiel.global_config.port);
	} else {
		http.createServer(listener).listen(kiel.global_config.port);
	}
	console.log("Server now running at "+kiel.global_config.domain+":" + kiel.global_config.port);

