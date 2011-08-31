var os = require('os'),
    exec = require('child_process').exec;

module.exports = (function() {
    /* internals */
    var reNetworkAct = /(\wX).*?\:(\d+)/g,
        oldData = {};

    function collect(callback) {
        var netTraffic = {};
        var adapter = exec('/sbin/ifconfig eth0 | grep "RX bytes"', function(err, data, stderr){
            var match;
            // get the first match
            match = reNetworkAct.exec(data);

            while (match) {
                netTraffic[match[1]] = match[2];
                match = reNetworkAct.exec(data);
            } // while

            netTraffic.tickCount = new Date().getTime();
            callback(netTraffic);
        });
    } // collect

    collect(function(traffic) {
        oldData = traffic;
    });

    function run(callback) {
        function compare(newData) {
            var timeElapsed = newData.tickCount - oldData.tickCount,
                netIO = {
                    transmit : Math.floor((newData.TX - oldData.TX) * (1000 / timeElapsed)),
                    receive : Math.floor((newData.RX - oldData.RX) * (1000 / timeElapsed))
                };
                // reset the Data for the next pass
                oldData = newData;
                //console.log(netIO);
                callback(netIO);
        } // compare
        collect(compare);
    } // run
    
    /* exports */
    
    return {
        // define the frequency for 
        frequency: '* * * * * *',
        run: run
    };
})();
