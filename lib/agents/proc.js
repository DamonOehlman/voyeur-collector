var os = require('os'),
    util = require('util'),
    exec = require('child_process').exec,
    BaseAgent = require('../agent').BaseAgent;
    
function readProcesses(command, callback) {
    var ps = exec(command, function(err, stdout, stderr) {
        var lines = (stdout || '').split('\n').slice(1),
            processes = [],
            sortedProcesses;
        
        lines.forEach(function(line) {
            var data = line.split(/\s+/).slice(1),
                psData = {
                    cpu: parseFloat(data[0]),
                    mem: parseFloat(data[1]),
                    process: data.slice(2).join(' ')
                };
                
            if (psData.cpu >= 0.5 || psData.mem >= 0.5) {
                processes.push(psData);
            } // if
        });
        
        callback(null, processes.sort(function(a, b) {
            return b.cpu - a.cpu;
        }));
    });
};

var Agent = exports.Agent = function() {
    this.frequency = '*/2 * * * * *';
};

util.inherits(Agent, BaseAgent);

Agent.prototype.run = function(callback) {
    var command = this.opts.command || 'ps -A -o %cpu,%mem,fname,command';
    
    readProcesses(command, function(err, processes) {
        if (! err) {
            callback(processes.slice(0, 5), processes.slice(5));
        } // if
    });
};


/*
module.exports = (function() {

    function run(callback) {
       // The following code is taken from https://github.com/codejoust/node-sysmon/blob/master/core.js line 36 - 50
        var ps = exec('ps -A -o %cpu,%mem,pid,user,fname,command', function(err, stdout, stderr) {
            var ps_raw = (' ' + stdout).split("\n").slice(1, 5).reverse();
            var processes = [];

            for (var i = 0; i < ps_raw.length; i++) {
                var proc = ps_raw[i].split(/ +/);

                if (proc[0] == '') { 
                    proc.shift();
                } // if

                processes.push({
                    pnm: proc[4],
                    cpu: proc[0],
                    mem: proc[1],
                    pid: proc[2],
                    usr: proc[3]
                });
                
            } // for      
            callback(processes); 
        }); // ps
    } // callback
    
    return {
        // define the frequency for 
        frequency: '* * * * * *',
        run: run
    };
})();

*/
