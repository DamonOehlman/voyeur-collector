var os = require('os'),
    exec = require('child_process').exec;

module.exports = (function() {

    /* internals */

    function run(callback) {
       // The following code is taken from https://github.com/codejoust/node-sysmon/blob/master/core.js line 36 - 50
        var ps = exec('ps -e --sort=%cpu -o %cpu,%mem,pid,user,fname  | tail --lines 5', function(err, stdout, stderr) {
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
    
    /* exports */
    
    return {
        // define the frequency for 
        frequency: '* * * * * *',
        run: run
    };
})();
