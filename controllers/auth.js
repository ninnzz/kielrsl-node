var auth
	, db = require(__dirname + "/../helpers/ndb");

auth = function(kiel){

	var login_check = function(req,res,app){
			db._instance().collection('user',function(err,_collection){
				var crdntls = {}
					, slctbl = {};
				err && kiel.response(req, res, {data : err}, 404);
				req.post_args.source === "google" && req.post_args.google_token && (crdntls = {email:req.post_args.email, google_token:req.post_args.gtoken});
				req.post_args.source === "self" && req.post_args.password && (crdntls = {email:req.post_args.email, password: kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt)});
				slctbl = {"email":1,"profile_info":1,"email_confirmed":1,"is_system_admin":1,"google_credentials":1,"contact_info":1};
				slctbl[app.name+'_data'] = 1;

				_collection.find(crdntls,slctbl).toArray(function(err,d){
					err && kiel.response(req, res, {data : err}, 404);
					if(d.length === 1) {
						kiel.logger("User identity confirmed: "+d[0]._id,'access')
						kiel.response(req, res, {user_data : d[0],application_data:app}, 200);
					} else {
						kiel.response(req, res, {data : "Username and password combination does not exist."}, 404);
					}
				});
			});		
		}
		, find_app = function(err,req,res,cb) {

			db._instance().collection('app',function(err,_collection){
				err && kiel.response(req, res, {data : err}, 404);
				_collection.find({_id:req.post_args.app_id}).toArray(function(err,d){
					err && kiel.response(req, res, {data : err}, 404);
					if(d.length === 1) {
						if(d[0].valid_source.indexOf(req.post_args.source) > -1){
							cb(req,res,d[0]);
						} else {
							kiel.response(req, res, {data : "Invalid source of request"}, 404);
						}
					} else {
						kiel.response(req, res, {data : "Application Id does not exists."}, 404);
					}
				});
			});
		};

	return {
		get : {
			import : function(req,res) {
				db.imports(null,['user','app']);
				kiel.response(req, res, {data : "Import process started. See logs and server message"}, 200);
		
			} , 
			random : function(req,res){
				p='';
				h = kiel.utils.hash('applicaion'+kiel.application_config.salt+new Date()+kiel.utils.random());
				if(req.get_args.pass){
					p = kiel.utils.hash(kiel.utils.hash(req.get_args.pass) + kiel.application_config.salt);
				}
				kiel.response(req, res, {data :h, date: new Date().getTime(),pass:p}, 200);
			}
		},

		post : {
			register : function(req,res) {
				
				var rqrd = ['email','password','app_id'];
				kiel.utils.required_fields(rqrd,req.post_args) || kiel.response(req, res, {data : "Missing fields"}, 500);

				kiel.response(req, res, {data :"registered"}, 200);
			} ,
			login : function(req,res) {
				var rqrd = ['email','app_id','source'];
				kiel.utils.required_fields(rqrd,req.post_args) || kiel.response(req, res, {data : "Missing fields"}, 500);
				find_app(null,req,res,login_check);
			}
		}, 

		put : {
			
		},

		delete : {

		}
	}
}

module.exports = auth;