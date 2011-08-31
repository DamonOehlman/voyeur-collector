var collector = require('../lib/collector'),
    collectionProcess;

console.log('Collecting 5 seconds worth of data');

collectionProcess = collector.collectToDB();
collectionProcess.collector.on('data', function(agentId, data, details) {
   console.log(agentId, data); 
});

setTimeout(collectionProcess.stop, 5000);