var user = function(kiel){
	var mongoose = require("mongoose");

	return {
		get : {
			index : function(req,res) {

				//perform any data manipulation
				data = {

					"_id"	: 1,									//could be object id
					"email"	: "nreclarin@gmail.com",
					"password"	: "********",						
					"fname" : "nino",
					"lname"	: "eclarin",
					"birthdate" : 1231231231,
					"custom_url"	: "pprmint",					//unique for URL
					"avatar"	: "http://url.to.image.jpg",
					"paypal"	: "nreclarin@gmail.com",
					"activity"	: false,							//primary email already confirmed
					"confirmation_token"	: "kjhashd9n81hiu",		//hash of email for email confirmation
					"active"	: false,							//active user, for soft delete purposes
					"referrer"	: 2,
					"is_system_admin"	: false,					//check if its a system admin
					"google_credentials":
						{
							"access_token"	: "",
							"token_type"	: "Bearer",
							"expires_in"	: 3600,
							"id_token"		: "",
							"refresh_token"	: "",
							"created"		: 1393925687
						},

					"contact_info":{
						"skype"		: "username",
						"facebook"	: "username",
						"twitter"	: "username",
						"phone"		: ["+63912312312","+6312512312","222-224-212"],
						"address"	: {
							"street_address"	: "street1 tayabas",
							"city"	: "tayabas",
							"state" : "quezon",
							"country"	: "PH",
							"postal_code" : 12345
						}
					},

					"freedom_data" : {
						"channels"	: [1,2,3,4,5,6,7],
						"networks_owned"	: [1,2,3,4,5,6],
						"networks_managed"	: [1,2,3,4,5,6],
						"music_labels"		: [1,2,3,4,5],
						"admin"				: ["user.add",""]
					},

					"heartbeat_data" : {
						"staff"				: []
					},

					"created_at"	: 11123123123,
					"updated_at"	: 12312541231
				};
				
				//example in loading the logs
				kiel.logger("Finised exectuing users",'access');
				//example in acessing the response
				kiel.response(req, res, {data : [data]}, 200);
			}
		},

		post : {
			index : function(res,req) {
				return;
			}
		}, 

		put : {

		},

		delete : {

		}
	}
}

module.exports = user;