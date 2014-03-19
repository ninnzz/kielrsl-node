var auth
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request');

auth = function(kiel){

	var login_check = function(req,res,app){
			db._instance().collection('user',function(err,_collection){
				var crdntls = {}
					, slctbl = {};
				err && kiel.response(req, res, {data : err}, 500);

				(req.post_args.password || req.post_args.google_access_token) && (crdntls = {email:req.post_args.email});
				slctbl = {"email":1,"profile_info":1,"password":1,"google_refresh_token":1,"email_confirmed":1,"is_system_admin":1,"google_credentials":1,"contact_info":1};
				slctbl[app.name+'_data'] = 1;
				
				if(Object.keys(crdntls).length === 0)
					throw "Invalid credentials for login.";
				console.log(crdntls);
				_collection.find(crdntls,slctbl).toArray(function(err,d){
					err && kiel.response(req, res, {data : err}, 500);
					console.log(d.length);
					console.log(d);
					if(d.length === 1) {
						req.post_args.source === "self" && d[0].password != kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt) && (er = "Password does not match.");
						if(typeof er !== 'undefined'){
							kiel.response(req, res, {data : er}, 500);
							return;
						}
						if(req.post_args.source === "google" && req.post_args.google_access_token){
							curl("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+req.post_args.google_access_token ,function(err,rs,body){
								if(!err && rs.statusCode == 200) {
									var s = JSON.parse(body);
									if(s.email !== d[0].email) {
										kiel.response(req, res, {data : "Invalid access token for email."}, 500);
										return;
									} else {
										kiel.logger("User identity confirmed [google]: "+d[0]._id,'access')
										kiel.response(req, res, {user_data : d[0],application:app.id}, 200);
									}

								} else {
									err || (err = "Cannot authenticate google access token, token might be expired or invalid.");
									kiel.response(req, res, {data : err}, 500);
									return;
								}
							});
						} else {
							kiel.logger("User identity confirmed [login]: "+d[0]._id,'access')
							kiel.response(req, res, {user_data : d[0],application:app.id}, 200);
						}
					} else {
						kiel.response(req, res, {data : "That email does not belong to any account.", new_user : true}, 404);
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
							try{
								cb(req,res,d[0]);
							} catch (err) {
								kiel.response(req, res, {data : err}, 500);
							}
						} else {
							kiel.response(req, res, {data : "Invalid source of request"}, 500);
						}
					} else {
						kiel.response(req, res, {data : "Application Id does not exists."}, 500);
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
			login : function(req,res) {
				var rqrd = ['email','app_id','source'];
				kiel.utils.required_fields(rqrd,req.post_args) || kiel.response(req, res, {data : "Missing fields"}, 500);
				find_app(null,req,res,login_check);
			} , 
			logout : function(req,res) {

			} ,
			request_token : function(req,res) {

			} ,
			access_token : function (req,res) {

			}
		}, 

		put : {
			
		},

		delete : {

		}
	}
}

module.exports = auth;