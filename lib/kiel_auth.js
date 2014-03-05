var http = require("http")
    , qs = require("querystring")
    , fs = require("fs")
    , util = require("util")
    , url = require("url")
    , mysql = require('mysql')												//put this later to the data config
    , mongoose = require("mongoose")
    , global_config = require(__dirname + "/../config/config")				//call data handler depending on config
    , application_config = require(__dirname + "/../config/application")	//call data handler depending on config
    , controller_cache = {}													//for custom cache, check if the controller is updated
    //build custom loader class later to load global vars
    , logger 	= require("./logger")()
    , response 	= require("./response")(application_config,util)
    , listener 	= require("./listener")(qs,fs,util,url,global_config,application_config,controller_cache,response,logger);

http.createServer(listener).listen(global_config.port);
console.log("Server now running at "+global_config.domain+":" + global_config.port);

