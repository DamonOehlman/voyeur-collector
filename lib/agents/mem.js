var os = require('os'),
    util = require('util'),
    BaseAgent = require('../agent').BaseAgent,
    totalMem = os.totalmem();
    
var Agent = exports.Agent = function() {
};

util.inherits(Agent, BaseAgent);

Agent.prototype.run = function(callback) {
    // read the free memory
    var free = os.freemem();
    
    callback(this.roundVal((totalMem - free) / totalMem), {
        free: free,
        total: totalMem
    });
};