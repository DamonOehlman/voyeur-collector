var os = require('os');

module.exports = (function() {
    var cpuCores = os.cpus().length,
        cpuOld;
    /* internals */
    

    function collect() {
        var raw = os.cpus(),
            cpu = [];
        
        for (var ii=0; ii < cpuCores; ii++) {
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
    } // collect

    function calcLoad(cpuNew) {
        var idleDelta,
            tickDelta,
            totalTick,
            load = [];

        for (var ii=0; ii < cpuCores; ii++) {
            tickDelta = cpuNew[ii].total - cpuOld[ii].total;
            idleDelta = cpuNew[ii].idle - cpuOld[ii].idle;
            
            load[ii] =  1 - idleDelta / tickDelta; 
            cpuOld[ii] = cpuNew[ii];
        } // for

        return load;
    } // calcLoad

    cpuOld = collect();

    function run(callback) {
        callback(calcLoad(collect()));
    } // callback
    
    /* exports */
    
    return {
        // define the frequency for 
        frequency: 100, // '* * * * * *',
        run: run
    };

})();
