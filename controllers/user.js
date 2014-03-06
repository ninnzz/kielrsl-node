var user = function(response,logger){
	var mongoose = require("mongoose");

	return {
		get : {
			index : function(req,res) {

				//process database query here

				//example in loading the logs
				logger("Finised exectuing users",'access');
				//example in acessing the response
				response(req, res, {message : "Sample return from users"}, 200);
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