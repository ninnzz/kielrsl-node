var db = require(__dirname + "/../helpers/ndb");
var user = function(kiel){
	return {
		get : {
			index : function(req,res) {
				
				//example in loading the logs
				//example in acessing the response
				kiel.response(req, res, {data :"sample"}, 200);
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
