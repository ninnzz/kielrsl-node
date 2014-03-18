/**
 *  Utils Class
 * 
 */

var crypto = require('crypto');

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