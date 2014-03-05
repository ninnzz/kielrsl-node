/**
 *  Logger Class
 *  Logs the transactions and activity of the system
 *  @params data - accepts array,string or object. Body of the log
 *  @params mode - defines custom mode for each log requests [debug,access,application,controller] level logs
 */

var logger = function(){
    console.log("Logger class finished loading......");
    return function(data,mode)
        {
            var date = new Date();
            fs.appendFile(config.logs_folder + [date.getMonth(), date.getDay(), date.getFullYear(), mode || "debug"].join("_") + ".log", data + "\n", function (err) {
                err && console.log(err);
            });
        }
}

module.exports = logger;