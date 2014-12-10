var user
	, db = require(__dirname + "/../helpers/ndb");


user = function (kiel){

	var input_user = function (req,res,app) {
		var usr = {},
			d = new Date(),
			scps = ['self.edit'],
			final_scps,
			roles;
				
		/*** IMPORTANT ***/
		// for new projects that wants to use the user class, add your own custom user implementation here
		// you can create or use the existing user function just redefine the fields of your user object

		usr['profile_info'] 	= {custom_url : "", avatar : "", paypal : ""};
		usr['contact_info'] 	= {twitter : "", facebook : ""};
		usr.contact_info['address'] = {};
		usr.pfl = 'none';
		usr.language = 'EN';

		req.post_args.phones 			&& (usr.contact_info['phones'] = req.post_args.phones);
		req.post_args.email 		&& (usr['email'] = req.post_args.email );
		req.post_args.password 		&& (usr['password'] = kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt)  );
		req.post_args.fname 		&& (usr.profile_info['fname'] = req.post_args.fname );
		req.post_args.lname 		&& (usr.profile_info['lname'] = req.post_args.lname );
		req.post_args.avatar 		&& (usr.profile_info['avatar'] = req.post_args.avatar );
		req.post_args.birthdate 		&& (usr.profile_info['birthdate'] = req.post_args.birthdate );
		req.post_args.google_id 		&& (usr.profile_info['google_id'] = req.post_args.google_id );
		req.post_args.skype 			&& (usr.contact_info['skype'] = req.post_args.skype );
		req.post_args.google_refresh_token 	&& (usr['google_refresh_token'] = req.post_args.google_refresh_token );
		req.post_args.street_address		&& (usr.contact_info.address['street_address'] = req.post_args.street_address );
		req.post_args.city			&& (usr.contact_info.address['city'] = req.post_args.city );
		req.post_args.state			&& (usr.contact_info.address['state'] = req.post_args.state );
		req.post_args.country		&& (usr.contact_info.address['country'] = req.post_args.country );
		req.post_args.postal_code	&& (usr.contact_info.address['postal_code'] = req.post_args.postal_code );
		req.post_args.reason		&& (usr['reason'] = req.post_args.reason );
		req.post_args.referrer		&& (usr['referrer'] = req.post_args.referrer );
		req.post_args.referral_link		&& (usr['referral_link'] = req.post_args.referral_link );
		req.post_args.roles			&& (roles = req.post_args.roles.split(',').map(function (sc) { return sc.trim(); }) );
		req.post_args.password		&& (usr['pfl'] = 'internal');
	
		(req.post_args.scopes.split(',')).forEach(function (sc) {
			scps.push(sc.trim());
		});

		final_scps = scps.filter( function (elem, pos) {
			return scps.indexOf(elem) == pos;
		}); 

		usr['data_' + app._id]	= 	{	
										admin: false,
										roles: roles,
										forum_username: ''
									};
		
		usr['_id'] = kiel.utils.hash(d.getTime() + kiel.utils.random() + kiel.utils.hash(req.post_args.email) + kiel.application_config.salt)
		usr['created_at'] 		= d.getTime();
		usr['updated_at'] 		= d.getTime();
		usr['is_system_admin'] 	= false;
		usr['email_confirmed'] 	= false;
		//use md5 then decode later
		usr['confirmation_token'] = kiel.utils.hash(kiel.application_config.salt+ '-email-' + req.post_args.email);
		
		db._instance().collection('users',function (err,_collection){
			_collection.insert(usr, function (err) {
				if (err) {
					kiel.logger(err+" Failed to add user to db : "+usr._id,'db_debug');
					kiel.response(req, res, {data : "Failed to add user to db.", error:err}, 500);
				} else {
					kiel.logger("Added user to db : "+usr._id,'db_debug');
					delete usr.password;
					delete usr.confirmation_token;
					save_access_token(req, res, usr._id, app, final_scps, usr);
				}
			});
		});
	},
	valid_app = function (req,res) {
		db._instance().collection('app',function (err,_collection){
			if(err) { kiel.response(req, res, {data : err}, 404);return;}

			_collection.find({_id:req.post_args.app_id}).toArray(function (err,d){
				if(err) {
					kiel.response(req, res, {data : err}, 404);
					return;
				}
				if(d.length === 1) {
					try{
						input_user(req,res,d[0]);
					} catch (err) {
						console.dir(err);
						kiel.response(req, res, {data : err}, 500);
					}
				} else {
					kiel.response(req, res, {data : "Application Id does not exists."}, 500);
				}
			});
		});
	},
	save_access_token = function (req, res, uid, app, scopes, usr) {

		var dt = new Date()
				, oauth_scopes = []
				, access_token = {
					user_id : uid,
					app_id	: app._id,
					access_token : kiel.utils.hash(uid + dt.getTime()) + kiel.utils.hash(uid + kiel.utils.random()),
					expires : 0,
					created_at : dt.getTime()
				};

			scopes.forEach(function(sc) {
				oauth_scopes.push({ _id:kiel.utils.hash(access_token.access_token + app.scope_token + '.' + sc), 'access_token' : access_token.access_token, 'app_id' : access_token.app_id, 'scope' : app.scope_token + '.' + sc, 'created_at' : dt.getTime()});
			});
			console.log('INSERT SCOPES');
			console.log(oauth_scopes);
			console.log('================================');

			db._instance().collection('access_tokens',function(err,_collection){
				_collection.insert(access_token,function(err) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);		
						console.log(err); return;
					}
					db._instance().collection('oauth_session_scopes',function(err,_collection){
						if(err) {
							kiel.response(req, res, {data : err}, 500);	
							console.log('Failed Loading the scopes for access_token: ' + access_token.access_token); return;
						}
						_collection.insert(oauth_scopes,function(err){
							if(err) {
								kiel.response(req, res, {data : err}, 500);
								console.log('Failed saving oauth_scopes: '+ err ); return;
							}

							kiel.response(req, res, {data : usr, access_token : access_token.access_token, expires : access_token.expires}, 200);

						});
					});
				});
			});
	},
	check_prepended = function(prop, val) {
		if( prop.replace('exist.','') !== prop ) {
			return { 
						p :  prop.replace('exist.',''),
						val : { $exists : val}
					};
		}
		return false;
	};


	return {
		get : {
			index : function (req,res) {
				var rqrd = ['access_token'],
					scopes = ['self.view'],
					opt_scopes = ['admin.view_all', 'network.view'],
					rst,
					uid,
					prepend,
					condition = {},
					s_condition = {},
					limit = 20,
					skip = 0,
					sort = '_id',
					sort_order = 1,
					pp = '',
					user_ids = [];
				
				if(!(rst = kiel.utils.required_fields(rqrd,req.get_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}
	
				req.get_args.limit 	&& ( limit = +req.get_args.limit );
				req.get_args.skip 	&& ( skip = +req.get_args.skip );
				req.get_args.sort 	&& ( sort = req.get_args.sort );
				req.get_args.sort_order 	&& ( sort_order = req.get_args.sort_order*1 );
				
				s_condition[sort] = sort_order;
				
				kiel.utils.has_scopes(scopes, opt_scopes, req.get_args.access_token, function (err, d, scopes, app){
					if(err) { kiel.response(req, res, {data : err.message},err.response_code);return;}
					var selectables = {'_id':1, 'email':1, 'profile_info':1, 'email_confirmed':1, 'active':1, 'referrer':1, 'referral_link':1, 'language': 1, 'is_system_admin':1, 'contact_info':1, 'created_at':1, 'updated_at':1, 'pfl':1},
						allowed = false;
					//TODO change selectables here depending on the scopes

					selectables['data_' + d.app_id] = 1;
					if (req.get_args.self) { 
						condition._id = d.user_id;
					} else {
						scopes.forEach(function (s) {
							if (!!~[app.scope_token + '.admin.view_all', app.scope_token + '.network.view'].indexOf(s.scope)) {
								allowed = true;
							}
						});
						
						if (req.get_args.user_id && allowed) {
							tmp = req.get_args.user_id.split(',').map(function (uid) {
								return uid.trim();
							});

							condition._id = {
								$in: tmp
							}
							
						} else {
							// kiel.response(req, res, {data :"You don't have the right access_token to do that."}, 404);
						}
					}

					for (var prop in req.get_args) {
						pp = prop.replace('app.',  'data_' + d.app_id + '.');
						if ( [ '_id', 'user_id', 'password', 'self', 'access_token', 'limit', 'skip', 'sort', 'sort_order'].indexOf(prop) <= -1 ) {
							if (req.get_args[prop] == 'true' || req.get_args[prop] == 'false') {

								prepend = check_prepended(pp, (req.get_args[prop] == 'true' ? true : false) );
								if (prepend) {
									condition[prepend.p] = prepend.val;
								} else {
									condition[pp] = req.get_args[prop];
								}
							} else if ( !isNaN(req.get_args[prop])  && req.get_args[prop] !== '' ) {
								condition[ prop.replace('app.',  'data_' + d.app_id + '.') ] = req.get_args[prop] * 1;
							} else if (prop === 'search') {
								if (!condition.$or) {
									condition.$or = [];
								}
								condition.$or.push({ 'profile_info.lname': req.get_args[prop] });
								condition.$or.push({ 'profile_info.fname': req.get_args[prop] });
								condition.$or.push({ 'username': req.get_args[prop] });
								condition.$or.push({ 'email': req.get_args[prop] });
							} else if (prop != 'user_id') {
								prepend = check_prepended(pp, req.get_args[prop]);
								if (prepend) {
									condition[prepend.p] = prepend.val;
								} else {
									condition[pp] = req.get_args[prop];
								}
							}
						}
					}
					db._instance().collection('users',function (err,_collection) {
						if(err){ kiel.response(req, res, {data : err}, 500); return;}
						console.log("=============== Search Condition ===============");
						console.log(condition);

						_collection.find(condition ,selectables)
							.sort(s_condition)
							.skip(skip)
							.limit(limit)
							.toArray(function (err,user) {
								if(err){ kiel.response(req, res, {data : err}, 500); return;}
								if(user.length != 0) {
									kiel.response(req, res, {users:user}, 200);
									return;
								} else {
									kiel.response(req, res, {data :"User not found."}, 404);		
								}
							});
					});
				});
			},

			user_count : function (req, res) {
			// 	db._instance().collection('users',function (err,_collection){
			// 		if(err){ kiel.response(req, res, {data : err}, 500); return;}
			// 		_collection.find({}).toArray(function (err,d){
			// 			if(d.length > 0){
			// 				kiel.response(req, res, {data :"Email is already associated with an existing account."}, 404);
			// 			} else {
			// 				try{
			// 					valid_app(req,res);
			// 				} catch (err) {
			// 					kiel.response(req, res, {data : err}, 500);
			// 				}
			// 			}
			// 		});
			// 	});
			}
		},

		post : {
			register : function (req,res) {
				var rqrd = ['email','app_id','fname','lname','scopes']
					, rst;
					console.log(req.post_args);

				if(!(rst = kiel.utils.required_fields(rqrd,req.post_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}
				db._instance().collection('users',function (err,_collection){
					if(err){ kiel.response(req, res, {data : err}, 500); return;}
					_collection.find({email:req.post_args.email}).toArray(function (err,d){
						if(d.length > 0){
							kiel.response(req, res, {data :"Email is already associated with an existing account."}, 404);
						} else {
							try{
								valid_app(req,res);
							} catch (err) {
								kiel.response(req, res, {data : err}, 500);
							}
						}
					});
				});

			} ,
		}, 

		put : {
			index : function (req,res) {
				var rqrd = ['access_token']
					, user_id
					, rst
					, scps = ['self.edit','self.view']
					, admin_edit = false;
				if(!(rst = kiel.utils.required_fields(rqrd,req.put_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}

				req.put_args.user_id && ((scps = ['users.edit','admin.edit_all']) && (admin_edit = true));
				
				//checks the access token to proper edit mapping. Allows user to only edit themselves
				kiel.utils.has_scopes(scps, null, req.put_args.access_token, function (err,data){
					if(err){ kiel.response(req, res, {data : err.message}, err.response_code); return; }	
					user_id = admin_edit?req.put_args.user_id:data.user_id;
					db._instance().collection('users',function (err,_collection){
						if(err) {callback({message:err,response_code:500});return;}
						_collection.find({_id:user_id}).toArray(function (err,user) {
							if(err) { kiel.response(req, res, {data : err}, 500);return;}
							if(user.length === 0) {
								kiel.response(req, res, {data : "User not found."}, 404);
							} else {
								var usr = user[0]
									,dt = new Date();
								
								usr.contact_info.address = usr.contact_info.address || {};

								req.put_args.password 			&& (usr.profile_info['password'] = kiel.utils.hash(kiel.utils.hash(req.put_args.password) + kiel.application_config.salt) );
								req.put_args.fname 				&& (usr.profile_info['fname'] = req.put_args.fname );
								req.put_args.lname 				&& (usr.profile_info['lname'] = req.put_args.lname );
								req.put_args.avatar 			&& (usr.profile_info['avatar'] = req.put_args.avatar );
								req.put_args.paypal 			&& (usr.profile_info['paypal'] = req.put_args.paypal );
								req.put_args.custom_url 		&& (usr.profile_info['custom_url'] = req.put_args.custom_url );
								req.put_args.birthdate 			&& (usr.profile_info['birthdate'] = req.put_args.birthdate );
								req.put_args.skype 				&& (usr.contact_info['skype'] = req.put_args.skype );
								req.put_args.facebook 			&& (usr.contact_info['facebook'] = req.put_args.facebook );
								req.put_args.twitter 			&& (usr.contact_info['twitter'] = req.put_args.twitter );
								req.put_args.phones 			&& (usr.contact_info['phones'] = req.put_args.phones );
								req.put_args.google_refresh_token 	&& (usr['google_refresh_token'] = req.put_args.google_refresh_token );
								req.put_args.street_address			&& (usr.contact_info.address['street_address'] = req.put_args.street_address );
								req.put_args.city				&& (usr.contact_info.address['city'] = req.put_args.city );
								req.put_args.state				&& (usr.contact_info.address['state'] = req.put_args.state );
								req.put_args.country			&& (usr.contact_info.address['country'] = req.put_args.country );
								req.put_args.postal_code			&& (usr.contact_info.address['postal_code'] = req.put_args.postal_code );
								req.put_args.referrer			&& (usr['referrer'] = req.put_args.referrer );
								req.put_args.language 			&& (usr.language = req.put_args.language);
								usr.profile_info['updated_at'] = dt.getTime();
								
								_collection.update({_id:user_id}, usr,function (err,d) {
									if(err) { kiel.response(req, res, {data : err}, 500);return;}
									if(d === 1) {
										var ret = {
											_id : usr._id,
											email : usr.email,
											profile_info : usr.profile_info,
											email_confirmed : usr.email_confirmed,
											email_confirmed : usr.email_confirmed,
											active : usr.active,
											referrer : usr.referrer,
											is_system_admin : usr.is_system_admin,
											contact_info : usr.contact_info,
											created_at : usr.created_at,
											updated_at : usr.updated_at
										};
										kiel.response(req, res, {user_data : ret}, 200);
										return;
									} else {
										kiel.response(req, res, {data : "Failed in updating user info."}, 401);
										return;
									}
								});
							}
						});
					});
				});
			}
		},

		delete : {
			index : function (req,res) {
				var rqrd = ['user_id']
					, user_id
					, rst
					, scps = ['self.edit','self.view']
					, admin_edit = false;
				if(!(rst = kiel.utils.required_fields(rqrd,req.delete_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}

				db._instance().collection('access_token',function (err,_collection) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					_collection.remove({user_id:req.delete_args.user_id},function (err,dcs) {
						if (err) {
							kiel.response(req, res, {data : err}, 500);
							return;
						}
					});
				});
				db._instance().collection('users',function (err,_collection) {
					if(err) {
						kiel.response(req, res, {data : err}, 500);
						return;
					}
					_collection.remove({user_id:req.delete_args.user_id},function (err,dcs) {
						if (err) {
							kiel.response(req, res, {data : err}, 500);
							return;
						}
					});
				});

				return kiel.response(req, res, {data : "Deleted: "+req.delete_args.user_id}, 200);
			}
		}
	}
}

module.exports = user;
