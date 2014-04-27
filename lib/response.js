/**
 *  Response Class
 *  Returns the response of each request to the client  
 *  @params req  - request made by the client
 *  @params res  - contains the response object
 *  @params data - contains the response body and data to be returned
 *  @params http_code  - http_code of response, default to 200/Ok (see list of all available HTTP Response Codes)
 */

var response = function(application_config,util)
{
    console.log("Responder class finished loading......");
    return function (req, res, data, http_code)
        {

            if (req.method === 'OPTIONS') {
                res.end();
                return;
            }
            data.memory_usage = util.inspect(process.memoryUsage());
            data.response_time = +new Date() - (+req.response_time);
            data.method = req.method.toUpperCase();
            data.action = req.action;
            data.object = req.obj_name;
            
            res.writeHead((http_code = http_code || 200), {
                "Content-Type" : application_config.response_type,
                "Content-Type" : application_config.response_type,
                "HTTP/1.1" : http_code,
                "Status" : http_code,
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Methods" : "GET,PUT,POST,DELETE",
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Credentials" : true,
                'Content-Length': JSON.stringify(data).length
            });
           
            res.write(JSON.stringify(data));
            res.end();
            return;
        }
}

module.exports = response