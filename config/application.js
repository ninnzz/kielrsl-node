var application = {
	"response_type" : "application/json",	//set the Contetnt-Type for each response
	
	"base_url"		: "/",					//set base_url for the application
	
	"logging"		: true,					//set false if you don't want logs
	
	"absolute_path"  : ""					//sets the absolute path before the application
											// if the url path is http://mywebsite.com/sites/node-server/application_folder
											//set the absolute path to "/sites/node-server" to avoid errors
}
console.log("Application config files loaded......");
module.exports = application;