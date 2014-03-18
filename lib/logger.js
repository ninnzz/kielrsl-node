/**
 *  Logger Class
 *  Logs the transactions and activity of the system
 *  @params data - accepts array,string or object. Body of the log
 *  @params mode - defines custom mode for each log requests [debug,access,application,controller] level logs
 */

var logger = function(fs,global_config){
	fs || (fs = require("fs"));
	global_config || (global_config = require(__dirname + "/../config/global_config"));
	
    return function(data,mode)
        {
            var date = new Date();
            fs.appendFile(__dirname + "/../logs/app_log_" + [date.getMonth(), date.getDay(), date.getFullYear(), mode || "debug"].join("_") + ".log", data + "\n", function (err) {
                err && console.log(err);
            });
        }
}

module.exports = logger;