var client
	, db = require(__dirname + "/../helpers/ndb")
	, d = new Date()
	, max_client_post = 5
	


client = function(kiel){

	return {
		get : {
			requests : function(req,res) {
				var options = {}
					, limit = 20
					, offset = 0;

				var selectables = {};

				req.get_args.user_id 				&& (options['user_id'] 			= req.get_args.user_id );
				req.get_args.is_done 				&& (options['is_done'] 			= req.get_args.is_done==1?true:false );
				req.get_args.limit 					&& (limit						= req.get_args.limit );
				req.get_args.offset 				&& (offset			 			= req.get_args.offset );
				req.get_args.preferred_provider 	&& (options['preferred_provider']	= req.get_args.preferred_provider );
				req.get_args.query 					&& (options['$text'] = {$search:req.get_args.query } );

				db._instance().collection('client_posting',function(err,_collection){
					_collection.find(options,  { score: { $meta: "textScore" } }, {limit: limit, skip:offset}).sort({ score: { $meta: "textScore" } }).toArray(function(err,dcs) {
						kiel.response(req, res, {data : dcs,error:err}, 200);
						return;
					});
				});
			}
		},

		post : {
			post_client_request : function(req,res) {

				var rqrd = ['session_key','user_id','title','description','skill_tags','preferred_provider'];
				if(!kiel.utils.required_fields(rqrd,req.post_args)){
					kiel.response(req, res, {data : "Missing fields"}, 500);
					return;
				}
				db._instance().collection('client_posting',function(err,_collection){
					if(err){ kiel.response(req, res, {data : err}, 500); return;}
					_collection.find({user_id : req.post_args.user_id, active : true, is_done : false}).toArray(function(err,data){
						var cpost = {};

						if(data.length > 5) {
							kiel.response(req, res, {data : 'Exceeded max number of posting. Please make sure to delete or wait for a request to finish.' }, 400);return;
							return;
						}	

						console.log(data.length);

						req.post_args.user_id 		&& (cpost['user_id'] 		= req.post_args.user_id );
						req.post_args.title 		&& (cpost['title'] 			= req.post_args.title );
						req.post_args.description 	&& (cpost['description'] 	= req.post_args.description );
						req.post_args.skill_tags 	&& (cpost['skill_tags']		= req.post_args.skill_tags.split(',') );
						req.post_args.preferred_provider 	&& (cpost['preferred_provider']	= req.post_args.preferred_provider );

						//add notif server call to update notif servers

						cpost['_id'] 			= kiel.utils.hash(d.getTime() + kiel.utils.random() + kiel.utils.hash(req.post_args.email) + kiel.application_config.salt)
						cpost['active'] 		= true;
						cpost['is_done'] 		= false;
						cpost['accepted_by'] 	= false;
						cpost['provider_post_id'] 	= null;
						cpost['rating']	 		= 0;
						cpost['flag_count']	 	= 0;
						cpost['output_link']	= null;
						cpost['created_at'] 	= d.getTime();
						cpost['updated_at'] 	= d.getTime();

						_collection.insert(cpost,function(err,inserted) {
							if(err) { kiel.response(req, res, {data : err}, 500);return;}
							if(inserted.length > 0) {
								kiel.response(req, res, {data : inserted }, 200);return;
							} else {
								kiel.response(req, res, {data : 'Failed to insert data.' }, 500);return;
							}
						});
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

module.exports = client;
