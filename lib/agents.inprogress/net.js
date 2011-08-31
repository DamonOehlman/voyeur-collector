var os = require('os'),
    exec = require('child_process').exec,
    util = require('util'),
    BaseAgent = require('../agent').BaseAgent;
    
function getStats(iface, callback) {
    var adapter = exec('/sbin/ifconfig', function(err, stdout, stderr) {
        console.log(stdout);
    });
} // getStats
    
var Agent = exports.Agent = function() {
    // initialise frequency to once every 5 seconds
    this.frequency = '*/5 * * * * *';
};

util.inherits(Agent, BaseAgent);

Agent.prototype.init = function(callback) {
    this.iface = this.opts.iface || 'eth0';
    
    getStats(this.iface, function(data) {
        console.log(data);
    });
}; // init

Agent.prototype.run = function(callback) {
    getStats(this.iface, function(data) {
        
    });
};

/*
module.exports = (function() {
    var reNetworkAct = /(\wX).*?\:(\d+)/g,
        oldData = {};

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
    
    return {
        // define the frequency for 
        frequency: '* * * * * *',
        run: run
    };
})();
*/
