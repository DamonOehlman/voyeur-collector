var os = require('os'),
    util = require('util'),
    BaseAgent = require('../agent').BaseAgent,
    coreCount = os.cpus().length;
    
function readCpu() {
    var raw = os.cpus(),
        cpu = [];
    
    for (var ii = coreCount; ii--; ) {
        var times = raw[ii].times,
            total = 0;
            
        for (var key in times) {
            total += times[key];
        } // for
        
        cpu[ii] = {
            total: total,
            idle: times.idle
        };
    } // for
    
    return cpu;
};

var Agent = exports.Agent = function() {
    // set the default frequency to 100ms
    this.frequency = 100;
    this.lastReading = readCpu();
};

util.inherits(Agent, BaseAgent);

Agent.prototype.run = function(callback) {
    var idleDelta, tickDelta, load = [],
        reading = readCpu();

    for (var ii = coreCount; ii--; ) {
        tickDelta = reading[ii].total - this.lastReading[ii].total;
        idleDelta = reading[ii].idle - this.lastReading[ii].idle;
        
        // calculate the load for the core
        load[ii] = this.roundVal(1 - (tickDelta ? idleDelta / tickDelta : 1));
        
        // update the last reading
        this.lastReading[ii] = reading[ii];
    } // for
    
    callback(load);
};