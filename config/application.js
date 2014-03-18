var application = {

	/**
	 *	set to false by default
	 *	if set true, server will look for the following certificate.
	 *	Specify the certificates and key path in this config
	 *
	 */

	"is_https"			: false,	
	"ssl_server_key"	: "/../certs/server.key",
	"ssl_server_cert"	: "/../certs/server.crt",
	"ssl_ca_cert"		: "/../certs/ca.crt",

	/**
   	 *	set the Contetnt-Type for each response
	 */

	"response_type" : "application/json",
	
	/**
	 * set base_url for the application
	 */

	"base_url"		: "/",					
	
	/**
	 * set false if you don't want logs
	 */

	"logging"		: true,					
	
	/**
	 * sets the absolute path before the application
	 * if the url path is http://mywebsite.com/sites/node-server/application_folder
	 * set the absolute path to "/sites/node-server" to avoid errors
	 *
	 */

	"absolute_path"  : "",

	/**
	 * SALT
	 */
	 "salt" : "c9d57c883aa42be96b9b063a266a4724"

}
console.log("Application config files loaded......");
module.exports = application;