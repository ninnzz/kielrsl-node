/**
 *  Utils Class
 * 
 */

var crypto = require('crypto')
	, db = require(__dirname + "/../helpers/ndb");
	
exports.required_fields = function(required,fields)
{
	for(var req in required){
		if(!fields.hasOwnProperty(required[req]))
			return false;
	}
	return true;
};

exports.hash = function (string, hash) {
    return crypto.createHash(hash || 'md5').update('' + string).digest('hex');
};

exports.random = function () {
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		str = "",
		i = 32;

    while (i--)
        str += possible.charAt(Math.floor(Math.random() * possible.length));

    return str;
};

exports.has_scopes = function(scope,access_token,callback) {
	var ac_collection
		, os_collection
		, app_collection,
		dt = new Date();
	
	db._instance().collection('access_tokens',function(err,_collection) {
		if(err) {callback({message:err,response_code:500});return;}
		ac_collection = _collection;
		ac_collection.find({access_token:access_token}).toArray(function(err,d) {
			if(d.length === 1) {
				if(d[0].expires !== 0 && d[0].expires < dt.getTime()){
					callback({message:'Invalid access_token. Access_token is expired.',response_code:400});
					return;
				}
				db._instance().collection('app',function(err,_collection){
					if(err) {callback({message:err,response_code:500});return;}
					app_collection = _collection;
					app_collection.find({_id:d[0].app_id}).toArray(function(err,a){
						if(err) {callback({message:err,response_code:500});return;}
						if(a.length === 1) {
							var scps = [];
							scope.forEach(function(sc) {
								scps.push({app_id:a[0]._id,scope: a[0].scope_token+'.'+sc ,access_token:access_token});
							});
							if(scps.length === 0) {
								callback({message:'Scopes are empty',response_code:400});
								return;
							}
							db._instance().collection('oauth_session_scopes',function(err,_collection){
								if(err) {callback({message:err,response_code:500});return;}
								os_collection = _collection;
								os_collection.find({$or:scps}).toArray(function(err,sc){
									if(err) {callback({message:err,response_code:500});return;}
									if(sc.length !== scope.length) {
										callback({message:'You dont have permission to do this operation.',response_code:401});
										return;
									}
									callback(null,d[0]);
									return;
								})

							});
						} else {
							callback({message:'Invalid access_token. Access_token app_id mismatch.',response_code:400});
							return;
						}
					});
				});
			} else {
				if(callback){
					callback({message:'Invalid access_token. Access_token not found.',response_code:404});
					return;
				}
			}
		});
	});
}