var auth
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request');

auth = function(kiel){

	var login_check = function(req,res,app){
			if(app.valid_source.indexOf(req.post_args.source) === -1)
				throw "Invalid source for a request";
			db._instance().collection('users',function(err,_collection){
				var crdntls = {}
					, slctbl = {};
				if(err){
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				(req.post_args.password || req.post_args.google_access_token) && (crdntls = {email:req.post_args.email});
				slctbl = {"email":1,"profile_info":1,"password":1,"google_refresh_token":1,"email_confirmed":1,"is_system_admin":1,"google_credentials":1,"contact_info":1};
				slctbl[app.name+'_data'] = 1;
				
				if(Object.keys(crdntls).length === 0)
					throw "Invalid credentials for login.";
				
				_collection.find(crdntls,slctbl).toArray(function(err,d){
					if(err){
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					if(d.length === 1) {
						// console.log(d[0]);
						req.post_args.source === "self" && d[0].password != kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt) && (er = "Password does not match.");
						if(typeof er !== 'undefined'){
							kiel.response(req, res, {data : er}, 400);
							return;
						}
						if(req.post_args.source === "google" && req.post_args.google_access_token){
							curl("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+req.post_args.google_access_token ,function(err,rs,body){
								if(!err && rs.statusCode == 200) {
									var s = JSON.parse(body);
									if(s.email !== d[0].email) {
										kiel.response(req, res, {data : "Invalid access token for email."}, 400);
										return;
									} else {
										kiel.logger("User identity confirmed [google]: "+d[0]._id,'access')
										kiel.response(req, res, {user_data : d[0],application:app.id}, 200);
									}

								} else {
									err || (err = "Cannot authenticate google access token, token might be expired or invalid.");
									kiel.response(req, res, {data : err}, 400);
									return;
								}
							});
						} else {
							kiel.logger("User identity confirmed [login]: "+d[0]._id,'access')
							kiel.response(req, res, {user_data : d[0],scope_token:app.scope_token}, 200);
						}
					} else {
						kiel.response(req, res, {data : "That email does not belong to any account.", new_user : true}, 404);
					}
				});
			});		
		}
		, find_app = function(err,req,res,app_id,cb) {
			db._instance().collection('app',function(err,_collection){
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				_collection.find({_id:app_id}).toArray(function(err,d){
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					if(d.length === 1) {
						try{
							cb(req,res,d[0]);
						} catch (err) {
							kiel.response(req, res, {data : err}, 500);
						}
					} else {
						kiel.response(req, res, {data : "Application Id does not exists."}, 500);
					}
				});
			});
		}
		, save_request_token = function(req,res,r_token_object) {

			
			db._instance().collection('request_tokens',function(err,_collection) {
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				_collection.remove({user_id:r_token_object.user_id, app_id: r_token_object.app_id},function(err,dcs) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					_collection.insert(r_token_object, function (err) { 
						if(err) {
							kiel.response(req, res, {data : err}, 500);
							return;
						}
						kiel.response(req, res, {request_token : r_token_object.request_token, expires : r_token_object.expires}, 200);
					});
				});
			});


		}
		, generate_request_token = function(req,res,app) {
			db._instance().collection('users',function(err,_collection){
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				_collection.find({_id:req.get_args.user_id}).toArray(function(err,d){
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					if(d.length > 0) {
						if(req.get_args.scope_token === kiel.utils.hash(req.get_args.app_id+'-'+app.secret)){
							try {
								var scps = [];
								(req.get_args.scopes.split(',')).forEach(function(sc) {
									scps.push({scope: req.get_args.scope_token+'.'+sc })
								});

								db._instance().collection('scopes',function(err,_collection) {
									if(err) {
										kiel.response(req, res, {data : err}, 500);
										return;
									}
									_collection.find({$or:scps}).toArray(function(err,d){
										if(err) {
											kiel.response(req, res, {data : err}, 500);
											return;
										}
										if(d.length === scps.length) {
											var d = new Date();
											save_request_token(req,res,{request_token: kiel.utils.hash(d.getTime())+kiel.utils.random(),user_id: req.get_args.user_id,app_id:req.get_args.app_id,scopes:scps,created_at:d.getTime(),expires:d.getTime()+60*60*1000});
										} else {
											kiel.response(req, res, {data : "Error in validating scopes"}, 400);									
										}
									});
								});

							} catch (err){
								kiel.response(req, res, {data : "Error parsing scopes: "+err}, 500);
							}
						} else {
							kiel.response(req, res, {data : "Unauthorize request."}, 404);						
						}
					} else {
						kiel.response(req, res, {data : "User does not exist."}, 404);
					}
				});
			});
		};

	return {
		get : {
			import : function(req,res) {
				db.imports(null,['users','app','scopes']);
				kiel.response(req, res, {data : "Import process started. See logs and server message"}, 200);
				// kiel.response(req, res, {data : kiel.utils.hash('831e4ee9529422134b4a010611601adf-beaa4de45f5461ce8f638e76f48dd3c5')}, 200);
		
			} , 
			random : function(req,res){
				p='';
				h = kiel.utils.hash('applicaion'+kiel.application_config.salt+new Date()+kiel.utils.random());
				if(req.get_args.pass){
					p = kiel.utils.hash(kiel.utils.hash(req.get_args.pass) + kiel.application_config.salt);
				}
				kiel.response(req, res, {data :h, date: new Date().getTime(),pass:p}, 200);
			} ,
			request_token : function(req,res) {
				var rqrd = ['app_id','scopes','user_id','scope_token'];
				if(!kiel.utils.required_fields(rqrd,req.get_args)) {
					kiel.response(req, res, {data : "Missing fields"}, 400);
					return;
				}	
				find_app(null,req,res,req.get_args.app_id,generate_request_token);
			} ,
			access_token : function (req,res) {

			}
		},

		post : {
			login : function(req,res) {
				var rqrd = ['email','app_id','source'];
				if(!kiel.utils.required_fields(rqrd,req.post_args)) {
					kiel.response(req, res, {data : "Missing fields"}, 400);
					return;
				}
				find_app(null,req,res,req.post_args.app_id,login_check);
			} , 
			logout : function(req,res) {
				var rqrd = ['access_token','app_id'];
				if(!kiel.utils.required_fields(rqrd,req.post_args)) {
					kiel.response(req, res, {data : "Missing fields"}, 400);
					return;
				}
			} 
		}, 

		put : {
			
		},

		delete : {

		}
	}
}

module.exports = auth;