kielrsl-node
============

**kielrsl-node** is a basic framework for making light-weight REST server in node js. It handles routing, data parsing and proper response type for each of the request.

============

#### Installation

All you need to do is clone the project, then run `npm install`.

For additional dependencies, just edit the package.json file.

============

#### Global Objects

##### Kiel Object

Holds all the global objects and variables both system and user defined.

###### Request Data
Request data are stored in the request object and are automatically parsed by the system

`req.post_args`	(object)	- contains the post data.

`req.get_args`	(object)	- contains the get data.

`req.put_args`	(object)	- contains the put data.

`req.delete_args` (object)	- contains the delete data.

Example:

`req.post_args.username 		//gets the value for username`
`req.get_args.limit 			//gets the value for limit`

##### Logger
`kiel.logger(message,log_type)` will invoke the logger class and store the logs in the log folder defined in config.

Parameters

*message* (string) - details about the log

*log_type* (string)	- can define your own log_type. Can be access log, debug logs etc etc. Default is "debug"

Example:

`kiel.logger('Failed to proccess request','debug')`

`kiel.logger('Successfully edited profile','user')`

##### User Includes
This can be used when defining a custom global function or any other global variables and objects that the user wants to declare.

See **/config/user_includes.js**

##### Response
Response class handles the response for each request.

Parameters

`req`	- the native request object of node

`res`	- the native response object of node

`data`	- data to be returend, can be a string of a json formatted data

`http_status_code`	- http status code for the return

Example:

`kiel.response(req, res, data, 200)`	//returns an HTTP status code of 200

`kiel.response(req, res, data, 500)`	//returns when internal server error


============

#### Contollers

Declaring a controller 

 ```javascript

 var user = function(kiel){
 	

 	/**
 	 *			OPTIONAL
 	 * You can do all the pre-initialization here.
 	 * Access any global variable by using the 'kiel' object
 	 *
 	 */
	var mongoose = require("mongoose")
		, mysql = kiel.mysql;

	
	return {

		/**
		 *
		 *	You can declare what HTTP method will you be using for each object.
		 *	Example:
		 *		For the user object, GET,POST,PUT,DELETE are all allowed.
		 *		
		 *	Declare each route as a property of the Method you want to include it with
		 *	Example
		 *		GET http://localhost:3000/user/lookup
		 *		This call will look for a 'lookup' propery inside the get object.
		 *		All of this will be contained in the User object
		 *		
		 *			
		 *		
		 */
		get : {
			index : function(req,res) {

				//perform any data manipulation

				//example in loading the logs
				kiel.logger("Finised exectuing users",'access');
				//example in acessing the response
				kiel.response(req, res, {message : "Sample return from users"}, 200);
			},
			
			lookup : function(req,res) {
				
				kiel.response(req, res, {message : "Routing for user lookup"}, 200);
			}
		},

		post : {
			index : function(res,req) {
				return;
			}
		}, 

		put : {

		},

		delete : {

		}
	}
}

module.exports = user;
