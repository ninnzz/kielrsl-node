kielrsl-node
============

**kielrsl-node** is a basic framework for making light-weight REST server in node js. It handles routing, data parsing and proper response type for each of the request.

============

#### Installation

All you need to do is clone the project, then run `npm install`.

For additional dependencies, just edit the package.json file.

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
