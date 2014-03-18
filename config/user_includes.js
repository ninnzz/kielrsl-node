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
	//you can also declare a function that you want to use globally
	foo : function(anycustom_parameter1, anycustom_parameter2){

	},
	//also, you can declare your custom global variable here
	key : "any value"	
}