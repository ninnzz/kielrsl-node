var user
	, db = require(__dirname + "/../helpers/ndb");


user = function(kiel){

	var input_user = function(req,res,app) {
		var usr = {}
			, d = new Date();
		
		usr['profile_info'] 	= {custom_url : "", avatar : "", paypal : ""};
		usr['contact_info'] 	= {phone : [], twitter : "", facebook : ""};
		usr.contact_info['address'] = {};
		usr[app.name+'_data']	= {user_scope : app.basic_scopes};
		
		req.post_args.email 		&& (usr['email'] = req.post_args.email );
		req.post_args.password 		&& (usr['password'] = kiel.utils.hash(kiel.utils.hash(req.post_args.password) + kiel.application_config.salt)  );
		req.post_args.fname 		&& (usr.profile_info['fname'] = req.post_args.fname );
		req.post_args.lname 		&& (usr.profile_info['lname'] = req.post_args.lname );
		req.post_args.avatar 		&& (usr.profile_info['avatar'] = req.post_args.avatar );
		req.post_args.birthday 		&& (usr.profile_info['birthdate'] = req.post_args.birthdate );
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
			if(err) {
				kiel.response(req, res, {data : err}, 404);
				return;
			}
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
				
				kiel.response(req, res, {data :"sample"}, 200);
			}
		},

		post : {
			register : function(req,res) {
				var rqrd = ['email','password','app_id','fname','lname','birthdate'];
				if(!kiel.utils.required_fields(rqrd,req.post_args)){
					kiel.response(req, res, {data : "Missing fields"}, 500);
					return;
				}
				db._instance().collection('users',function(err,_collection){
					if(err){
						kiel.response(req, res, {data : err}, 500);
						return;
					}
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

		},

		delete : {

		}
	}
}

module.exports = user;
