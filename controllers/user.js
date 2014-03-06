var user = function(kiel){
	var mongoose = require("mongoose");

	return {
		get : {
			index : function(req,res) {

				//perform any data manipulation

				//example in loading the logs
				kiel.logger("Finised exectuing users",'access');
				//example in acessing the response
				kiel.response(req, res, {message : "Sample return from users"}, 200);
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