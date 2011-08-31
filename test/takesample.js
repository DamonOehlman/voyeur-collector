var collector = require('../lib/collector'),
    collectionProcess,
    startTick = new Date().getTime();

console.log('Collecting 5 seconds worth of data');

collectionProcess = collector.collectToDB();
setTimeout(function() {
    collectionProcess.db.getSince(startTick, function(results) {
        for (var key in results.items) {
            console.log(key, results.items[key].length);
        } // for
    });
    
    collectionProcess.stop();
}, 5000);