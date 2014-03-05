var user = function(response,logger){
	return {
		get : {
			index : function(req,res) {

				//example in loading the logs
				logger("Finised exectuing users",'access');
				//example in acessing the response
				response(req, res, {message : "Hhahahahah Entered in users..! :D"}, 200);
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