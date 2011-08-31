var os = require('os');

module.exports = (function() {
    var data =  {
        "total" : os.totalmem()
    };

    /* internals */
    function collect() { 
        data.free = os.freemem();

        return data;
    }


    function run(callback) {
        callback(collect());
    } // callback
    
    /* exports */
    
    return {
        // define the frequency for 
        frequency: '* * * * * *',
        run: run
    };
})();
