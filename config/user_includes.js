/**
 *	Add all your custom included dependecies here
 *	Example
 *	var includes = {
 *		mysql 		: require("mysql"),
 *		postgres 	: require("postgres")
 *	}
 *
 *	Access your custom includes by calling  kiel.<name>
 *	on any controller.
 *	Example
 * 	var db = kiel.mysql;
 *
 *
 *	Important: Update the package.json file for dependencies.
 *
 */
console.log("User include files loaded");
module.exports = {
	mysql : require("mysql"),
	mongoose : require("mongoose")	
}