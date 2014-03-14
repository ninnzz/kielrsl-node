/**
 *  Utils Class
 * 
 */


exports.required_fields = function(required,fields)
{
	for(var req in required){
		if(!fields.hasOwnProperty(required[req]))
			return false;
	}
	return true;
}