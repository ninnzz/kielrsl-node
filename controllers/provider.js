var client
	, db = require(__dirname + "/../helpers/ndb")
	, d = new Date()
	, max_client_post = 5;


provider = function(kiel){

	return {
		get : {
			work_posts : function(req,res) {
				var options = {}
					, limit = 20
					, offset = 0;

				var selectables = {};

				req.get_args.user_id 				&& (options['user_id'] 		= req.get_args.user_id );
				req.get_args.full 					&& (options['remaining_spot'] 		= req.get_args.full==1?0:{$gt : 0} );
				req.get_args.limit 					&& (limit					= req.get_args.limit );
				req.get_args.offset 				&& (offset			 		= req.get_args.offset );
				req.get_args.query 					&& (options['$text'] 		= {$search:req.get_args.query } );

				db._instance().collection('provider_posting',function(err,_collection){
					_collection.find(options,  { score: { $meta: "textScore" } }, {limit: limit, skip:offset}).sort({ score: { $meta: "textScore" } }).toArray(function(err,dcs) {
						kiel.response(req, res, {data : dcs,error:err}, 200);
						return;
					});
				});
			}
		},

		post : {
			post_provider_offer : function(req,res) {

				var rqrd = ['session_key','user_id','title','description','skill_tags'];
				if(!kiel.utils.required_fields(rqrd,req.post_args)){
					kiel.response(req, res, {data : "Missing fields"}, 500);
					return;
				}
				db._instance().collection('provider_posting',function(err,_collection){
					if(err){ kiel.response(req, res, {data : err}, 500); return;}
					_collection.find({user_id : req.post_args.user_id, active : true}).toArray(function(err,data){
						var cpost = {};

						if(data.length > 3) {
							kiel.response(req, res, {data : 'Exceeded max number of posting. Please make sure to delete or wait for a request to finish.' }, 300);return;
							return;
						}	
						req.post_args.user_id 		&& (cpost['user_id'] 		= req.post_args.user_id );
						req.post_args.title 		&& (cpost['title'] 			= req.post_args.title );
						req.post_args.description 	&& (cpost['description'] 	= req.post_args.description );
						req.post_args.skill_tags 	&& (cpost['skill_tags']		= req.post_args.skill_tags.split(',') );
						
						cpost['_id'] 			= kiel.utils.hash(d.getTime() + kiel.utils.random() + kiel.utils.hash(req.post_args.email) + kiel.application_config.salt)
						cpost['active'] 		= true;
						cpost['remaining_spot'] = 5;
						cpost['flag_count']	 	= 0;
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

module.exports = provider;
