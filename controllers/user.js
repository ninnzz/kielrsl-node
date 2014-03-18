var user
	, db = require(__dirname + "/../helpers/ndb");




user = function(kiel){
	return {
		get : {
			index : function(req,res) {
				
				kiel.response(req, res, {data :"sample"}, 200);
			}
		},

		post : {
			register : function(req,res) {
				
				var rqrd = ['email','password','app_id'];
				kiel.utils.required_fields(rqrd,req.post_args) || kiel.response(req, res, {data : "Missing fields"}, 500);

				kiel.response(req, res, {data :"registered"}, 200);
			} ,
		}, 

		put : {

		},

		delete : {

		}
	}
}

module.exports = user;
