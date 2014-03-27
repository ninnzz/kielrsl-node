var listener = function(kiel)
{
    console.log("Listener class finished loading......");
    return function(req, res)
        {
            var url_parts = kiel.url.parse(req.url,true)
                , obj_name
                , ctrl_file
                , real_path = url_parts.pathname.substr(kiel.application_config.absolute_path.length)
                , path_components;

            req.response_time = new Date();
            req.obj_name    = ((path_components = real_path.split("/"))[1]) || "";
            req.action      = (path_components[2]) || "index";
            req.method      = req.method.toLowerCase();
            req.get_args    = url_parts.query;
            req.post_args   = {};
            req.put_args    = {};
            req.delete_args = {};

            kiel.logger(req.response_time.getHours()+':'+req.response_time.getMinutes()+':'+req.response_time.getSeconds()+'            '+req.connection.remoteAddress+' '+req.method.toUpperCase()+' '+url_parts.pathname+'  HTTP_VERSION '+req.httpVersion,'access');

            if(real_path === '/')
                    return kiel.response(req, res, {message : "No object path declared"}, 404);
            if(path_components.length && path_components.length > 3)
                    return kiel.response(req, res, {message : "Unknown object call format"}, 404);

            //pre-processes the data, triggered when doing post,put and delete requests
            req.on('data', function(chunk) {
                //stores the request data to the respective variables
                req.method === 'post'   && (req.post_args   = kiel.qs.parse(chunk.toString()));
                req.method === 'put'    && (req.put_args    = kiel.qs.parse(chunk.toString()));
                req.method === 'delete' && (req.delete_args = kiel.qs.parse(chunk.toString()));

                for(var r in req.get_args) 
                    if(req.get_args.r) 
                        req.body[r] = req.get_args.r;                    
                for(var r in req.post_args) 
                    if(req.post_args.r) 
                        req.body[r] = req.post_args.r;
                for(var r in req.put_args) 
                    if(req.put_args.r) 
                        req.body[r] = req.put_args.r;
                for(var r in req.delete_args) 
                    if(req.delete_args.r) 
                        req.body[r] = req.delete_args.r;
                    
            });
            
            //catches any misfires from the request
            req.on('error', function(err) {
                kiel.logger(req.response_time.getHours()+':'+req.response_time.getMinutes()+':'+req.response_time.getSeconds()+'            '+req.connection.remoteAddress+' '+req.method.toUpperCase()+' '+url_parts.pathname+'  HTTP_VERSION '+req.httpVersion+'  ERROR:'+err,'error');
                return kiel.response(req, res, {message : "Error on request:"+err}, 500);
            });

            //finishes the request processing
            req.on('end', function() {
                
                var curr_controller
                    , action;  
                kiel.logger('entered processing of request','logs');
                kiel.fs.stat(__dirname + "/../controllers/" + req.obj_name + ".js", function(err, stats){
                    if(err)          
                        return kiel.response(req, res, {message : "Controller not found: "+req.obj_name}, 404);

                    //cache the controller from file fetch and store it on an object
                    if (!kiel.controller_cache[req.obj_name] || (kiel.controller_cache[req.obj_name].mtime != +stats.mtime)) {
                        delete require.cache[require.resolve(__dirname + "/../controllers/" + req.obj_name)];
                        kiel.controller_cache[req.obj_name] = require(__dirname + "/../controllers/" + req.obj_name)(kiel);
                        kiel.controller_cache[req.obj_name].mtime = +stats.mtime;
                    }
                    
                    //recheck this line later, see the difference in speed
                    // kiel.controller_cache[req.obj_name] = kiel.controller_cache[req.obj_name](kiel);
                    if(!(curr_controller = kiel.controller_cache[req.obj_name][req.method]))
                         return kiel.response(req, res, {message : "Method '" + req.method + "' not allowed for object"}, 404);

                    if(!(action = curr_controller[req.action])) {
                         return kiel.response(req, res, {message : "Action '" + req.action + "' not allowed for object"}, 404);
                    }

                    return new action(req,res);
                }); //end fs path
            }); //end req.on('end')
        }
}


module.exports = listener;