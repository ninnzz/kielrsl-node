var user
	, db = require(__dirname + "/../helpers/ndb");


user = function(kiel){

	var input_user = function(req,res,app) {
		var usr = {}
			, d = new Date();
				
		/*** IMPORTANT ***/
		// for new projects that wants to use the user class, add your own custom user implementation here
		// you can create or use the existing user function just redefine the fields of your user object


		usr['profile_info'] 	= {custom_url : "", avatar : "", paypal : ""};
		usr['contact_info'] 	= {phone : [], twitter : "", facebook : ""};
		usr.contact_info['address'] = {};
		usr[app._id+'_data']	= {user_scope : app.basic_scopes};
		
		req.post_args.email 		&& (usr['email'] = req.post_args.email );
		req.post_args.password 		&& (usr['password'] = kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt)  );
		req.post_args.fname 		&& (usr.profile_info['fname'] = req.post_args.fname );
		req.post_args.lname 		&& (usr.profile_info['lname'] = req.post_args.lname );
		req.post_args.avatar 		&& (usr.profile_info['avatar'] = req.post_args.avatar );
		req.post_args.birthdate 		&& (usr.profile_info['birthdate'] = req.post_args.birthdate );
		req.post_args.skype 		&& (usr.contact_info['skype'] = req.post_args.skype );
		req.post_args.google_refresh_token 	&& (usr['google_refresh_token'] = req.post_args.google_refresh_token );
		req.post_args.street_address		&& (usr.contact_info.address['street_address'] = req.post_args.street_address );
		req.post_args.city			&& (usr.contact_info.address['city'] = req.post_args.city );
		req.post_args.state			&& (usr.contact_info.address['state'] = req.post_args.state );
		req.post_args.country		&& (usr.contact_info.address['country'] = req.post_args.country );
		req.post_args.postal_code	&& (usr.contact_info.address['postal_code'] = req.post_args.postal_code );
		req.post_args.referrer		&& (usr['referrer'] = req.post_args.referrer );
		
		usr['_id'] = kiel.utils.hash(d.getTime() + kiel.utils.random() + kiel.utils.hash(req.post_args.email) + kiel.application_config.salt)
		usr['created_at'] 		= d.getTime();
		usr['updated_at'] 		= d.getTime();
		usr['is_system_admin'] 	= false;
		usr['email_confirmed'] 	= false;
		//use md5 then decode later
		usr['confirmation_token'] = kiel.utils.hash(kiel.application_config.salt+ '-email-' + req.post_args.email);

		db._instance().collection('users',function(err,_collection){
			_collection.insert(usr, function (err) {
				if (err) {
					kiel.logger(err+" Failed to add user to db : "+usr._id,'db_debug');
					kiel.response(req, res, {data : "Failed to add user to db.", error:err}, 500);
				} else {
					kiel.logger("Added user to db : "+usr._id,'db_debug');
					delete usr.password;
					delete usr.confirmation_token;
					kiel.response(req, res, {data : usr}, 200);
				}
			});
		});


	}
	, valid_app = function(req,res) {
		db._instance().collection('app',function(err,_collection){
			if(err) { kiel.response(req, res, {data : err}, 404);return;}

			_collection.find({_id:req.post_args.app_id}).toArray(function(err,d){
				if(err) {
					kiel.response(req, res, {data : err}, 404);
					return;
				}
				if(d.length === 1) {
					try{
						input_user(req,res,d[0]);
					} catch (err) {
						kiel.response(req, res, {data : err}, 500);
					}
				} else {
					kiel.response(req, res, {data : "Application Id does not exists."}, 500);
				}
			});
		});
	};


	return {
		get : {
			index : function(req,res) {
				var rqrd = ['access_token']
					,scopes
					, rst;
				if(!(rst = kiel.utils.required_fields(rqrd,req.get_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}
				((req.get_args.self && (scopes = ['self.view'])) || (scopes = ['user.view']) );
				
				if(!req.get_args.self && !req.get_args.user_id) {
					kiel.response(req, res, {data : "Missing user_id"}, 404);
					return;
				}

				kiel.utils.has_scopes(scopes,req.get_args.access_token,function(err,d){
					if(err) { kiel.response(req, res, {data : err.message},err.response_code);return;}
					var selectables = {'_id':1,'email':1,'profile_info':1,'email_confirmed':1,'active':1,'referrer':1,'is_system_admin':1,'contact_info':1,'created_at':1,'updated_at':1};
					db._instance().collection('users',function(err,_collection) {
						if(err){ kiel.response(req, res, {data : err}, 500); return;}
						_collection.find({_id:d.user_id},selectables).toArray(function(err,user) {
							if(err){ kiel.response(req, res, {data : err}, 500); return;}
							if(user.length === 1) {
								kiel.response(req, res, {user_data:user[0]}, 200);
								return;
							} else {
								kiel.response(req, res, {data :"User not found."}, 404);		
							}
						});
					});
				});
			}
		},

		post : {
			register : function(req,res) {
				var rqrd = ['email','password','app_id','fname','lname','birthdate']
					, rst;
				if(!kiel.utils.required_fields(rqrd,req.post_args)){
					kiel.response(req, res, {data : "Missing fields"}, 500);
					return;
				}
				db._instance().collection('users',function(err,_collection){
					if(err){ kiel.response(req, res, {data : err}, 500); return;}
					_collection.find({email:req.post_args.email}).toArray(function(err,d){
						if(d.length > 0){
							kiel.response(req, res, {data :"Email is already associated with an existing account."}, 400);
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
			index : function(req,res) {
				var rqrd = ['access_token']
					, user_id
					, rst;
				if(!(rst = kiel.utils.required_fields(rqrd,req.put_args)).stat){
					kiel.response(req, res, {data : "Missing fields ["+rst.field+']'}, 500);
					return;
				}
				//checks the access token to proper edit mapping. Allows user to only edit themselves
				kiel.utils.has_scopes(['self.edit','self.view'],req.put_args.access_token,function(err,data){
					if(err){ kiel.response(req, res, {data : err.message}, err.response_code); return; }	
					user_id = data.user_id;
					db._instance().collection('users',function(err,_collection){
						if(err) {callback({message:err,response_code:500});return;}
						_collection.find({_id:user_id}).toArray(function(err,user) {
							if(err) { kiel.response(req, res, {data : err}, 500);return;}
							if(user.length === 0) {
								kiel.response(req, res, {data : "User not found."}, 404);
							} else {
								var usr = user[0]
									,dt = new Date();

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
								req.put_args.postal_code			&& (usr.contact_info.address['postal_code'] = req.put_args.putal_code );
								req.put_args.referrer			&& (usr['referrer'] = req.put_args.referrer );
								usr.profile_info['updated_at'] = dt.getTime();
								
								_collection.update({_id:user_id}, usr,function(err,d) {
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

		}
	}
}

module.exports = user;
