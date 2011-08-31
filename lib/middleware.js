exports.json = function(db, opts) {
    // initialise opts
    opts = opts || {};
    opts.path = '/samples';
    opts.defaultAge = opts.defaultAge || 30000;
    opts.authKey = undefined;
    
    // initialise variables
    var rePath = new RegExp('^' + opts.path + '/?(\\d*)');
    
    return function(req, res, next) {
        if (req && req.url) {
            var match = rePath.exec(req.url);
            
            // if we have a match, then respond to the request, otherwise pass to the next handler
            if (match) {
                // initialise the start tick
                var startTick = parseInt(match[1], 10) || (new Date().getTime() - opts.defaultAge);
                
                // get the requested samples
                db.getSince(startTick, function(err, details) {
                    res.setHeader('Content-Type', 'application/json');
                    
                    if (! err) {
                        res.statusCode = 200;
                        res.end(JSON.stringify(details));
                    }
                    else {
                        res.statusCode = 500;
                        res.end(err);
                    } // if..else
                });
            }
            else {
                next();
            } // if..else
        } // if
    };
};