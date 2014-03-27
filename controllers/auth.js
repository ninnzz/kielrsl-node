var auth
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request');



auth = function(kiel){

	var login_check = function(req,res,app){
			if(app.valid_source.indexOf(req.post_args.source) === -1)
				throw "Invalid source for a request";
			db._instance().collection('users',function(err,_collection){
				var crdntls = {}
					, slctbl = {}
					, er = null;
				if(err){
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				(req.post_args.password || req.post_args.google_access_token) && (crdntls = {email:req.post_args.email});
				slctbl = {"email":1,"profile_info":1,"password":1,"google_access_token":1,"email_confirmed":1,"is_system_admin":1,"google_credentials":1,"contact_info":1};
				slctbl[app.name+'_data'] = 1;
				
				if(Object.keys(crdntls).length === 0)
					throw "Invalid credentials for login.";
				
				_collection.find(crdntls,slctbl).toArray(function(err,d){
					if(err){
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					if(d.length === 1) {
						req.post_args.source === "self" && d[0].password !== kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt) && (er = "Password does not match.");
						console.log(er);
						console.log(req.post_args.source === "self" && d[0].password !== kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt) && (er = "Password does not match."));
						if(er){
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
										//add app if user of new app
										if(!d[0][app.name+'_data']) {
											add_app(_collection,app,d[0]);
											d[0][app.name+'_data'] = {user_scopes:app.basic_scopes};
										}
										delete d[0].password;
										delete d[0].google_access_token;
										kiel.logger("User identity confirmed [google]: "+d[0]._id,'access')
										kiel.response(req, res, {user_data : d[0],scope_token:app.scope_token}, 200);
									}

								} else {
									err || (err = "Cannot authenticate google access token, token might be expired or invalid.");
									kiel.response(req, res, {data : err}, 400);
									return;
								}
							});
						} else {
							//add app if user of new app
							if(!d[0][app.name+'_data']) {
								add_app(_collection,app,d[0]);
								d[0][app.name+'_data'] = {user_scopes:app.basic_scopes};
							}
							delete d[0].password;
							delete d[0].google_access_token;
							kiel.logger("User identity confirmed [login]: "+d[0]._id,'access')
							kiel.response(req, res, {user_data : d[0],scope_token:app.scope_token}, 200);
						}
					} else {
						kiel.response(req, res, {data : "That email does not belong to any account.", new_user : true}, 404);
					}
				});
			});		
		}
		, add_app = function(user_collection,app,user) {
			console.log('added new scopes');
			var crd = {};
			crd[app.name+'_data'] = {user_scopes:app.basic_scopes};
			user_collection.update({_id:user._id}, {'$set':crd},function(err,d) {
				console.log(err);
				console.log(d);
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
						if(err) { kiel.response(req, res, {data : err}, 500);return;}
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
									scps.push({scope: req.get_args.scope_token+'.'+sc });
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
		}
		, insert_access_token = function(req,res,request_token,_collection,ac) {
			var dt = new Date()
				, oauth_scopes = []
				, access_token = {
					user_id : req.get_args.user_id,
					app_id	: req.get_args.app_id,
					access_token : ac,
					expires : 0,
					created_at : dt.getTime()
				};

			request_token.scopes.forEach(function(sc) {
				oauth_scopes.push({'access_token': access_token.access_token,'app_id':access_token.app_id, 'scope':sc.scope,'created_at':dt.getTime()});
			});
			_collection.insert(access_token,function(err) {
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}
				db._instance().collection('request_tokens',function(err,_collection) {
					_collection.remove({request_token:request_token.request_token},function(err,d){
						if(err) {
							kiel.logger('Failed deleting request_token: '+request_token.request_token,'db_debug');
							return;
						}
						kiel.logger('Deleted request_token: '+request_token.request_token,'db_debug');
					})
				});
				db._instance().collection('oauth_session_scopes',function(err,_collection){
					if(err) {
						kiel.logger('Failed Loading the scopes for access_token: '+access_token.access_token,'db_debug');
						return;
					}
					_collection.insert(oauth_scopes,function(err){
						if(err) {
							kiel.logger('Failed saving oauth_scopes: '+access_token.access_token,'db_debug');
							return;
						}
					});
				});
				kiel.response(req, res, {access_token : access_token.access_token, expires:access_token.expires}, 200);
			});
		}
		, save_access_token = function(req,res,request_token) {
			db._instance().collection('access_tokens',function(err,_collection) {
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}	
				_collection.find({user_id:req.get_args.user_id}).toArray(function(err,d) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					var dt = new Date()
						, ac = kiel.utils.hash(req.get_args.request_token + dt.getTime()) + kiel.utils.hash(req.get_args.user_id + kiel.utils.random());
					if(d.length === 0) {
						//if there are totally no access token for the user
						insert_access_token(req,res,request_token,_collection,ac);	
					} else {
						var crd = null;
						for(var i=0; i<d.length;i++) {
							if(req.get_args.app_id === d[i].app_id) {
								crd = {};
								//stop at here
								crd['app_id'] = d[i].app_id;
								crd['access_token'] = d[i].access_token;
								break;
							}
						}
						if(crd === null) {
							//adds another application
							insert_access_token(req,res,request_token,_collection,ac);
						} else {
							var access_token_collection = _collection;
							db._instance().collection('oauth_session_scopes',function(err,_collection) {
								_collection.remove(crd,function(err,d) {
									if(err) {
										kiel.response(req, res, {data : err}, 500);
										return;
									}
									access_token_collection.remove(crd,function(err,d){
										if(err) {
											kiel.response(req, res, {data : err}, 500);
											return;
										}
										insert_access_token(req,res,request_token,access_token_collection,crd.access_token);
									});
								});
							});
						}
					}
				});	
			});
		}
		, generate_access_token = function(req,res) {
			db._instance().collection('request_tokens', function(err,_collection) {
				if(err) {
					kiel.response(req, res, {data : err}, 500);
					return;
				}	
				_collection.find({request_token:req.get_args.request_token}).toArray(function(err,d) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}	
					var dt = new Date();
					/******TODO******/
					/*** Create a cron job to clear expired and unused request token ***/
					if(d.length !== 1 || d[0].app_id !== req.get_args.app_id || d[0].user_id !== req.get_args.user_id || d[0].expires <= dt.getTime()) {
						kiel.response(req, res, {data : "Invalid/Expired request token."}, 404);
						return;						
					} else {
						save_access_token(req,res,d[0]);
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
				var rqrd = ['app_id','request_token','user_id'];
				if(!kiel.utils.required_fields(rqrd,req.get_args)) {
					kiel.response(req, res, {data : "Missing fields"}, 400);
					return;
				}
				generate_access_token(req,res);
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
				db._instance().collection('access_tokens',function(err,_collection) {
					if(!kiel.utils.required_fields(rqrd,req.post_args)) {
						kiel.response(req, res, {data : "Missing fields"}, 400);
						return;
					}
					_collection.remove({access_token:req.post_args.access_token}, function(err,d) {
						if(!kiel.utils.required_fields(rqrd,req.post_args)) {
							kiel.response(req, res, {data : "Missing fields"}, 400);
							return;
						}
						db._instance().collection('oauth_session_scopes',function(err,_collection) {
							_collection.remove({access_token:req.post_args.access_token}, function(err,d) {
							});
						});
						kiel.response(req, res, {logged_out:true}, 200);
					});
				});
			} 
		}, 

		put : {
			
		},

		delete : {

		}
	}
}

module.exports = auth;