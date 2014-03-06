var kiel = {}
	, http = require("http")
	, user_includes = require(__dirname + "/../config/user_includes");


	/**
	 *
	 *	Sets the inlucde of each users
	 *	defined in config/user_includes and makes it a globa variable
	 *
	 */
	for(var include in user_includes){
		if(user_includes[include]){
			kiel[include] = user_includes[include];
		}
	}


	kiel.qs = require("querystring");
	kiel.fs = require("fs");
	kiel.util = require("util");
	kiel.url = require("url");
	kiel.global_config = require(__dirname + "/../config/global_config");		//call data handler depending on config
	kiel.application_config = require(__dirname + "/../config/application");	//call data handler depending on config
	kiel.controller_cache = {}													//for custom cache, check if the controller is updated

	kiel.logger 	= require("./logger")(kiel.fs,kiel.global_config);
	kiel.response 	= require("./response")(kiel.application_config,kiel.util);
	kiel.listener 	= require("./listener")(kiel);

http.createServer(kiel.listener).listen(kiel.global_config.port);
console.log("Server now running at "+kiel.global_config.domain+":" + kiel.global_config.port);

