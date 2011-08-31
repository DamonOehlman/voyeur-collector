var vows = require('vows'),
    assert = require('assert'),
    collector = require('../lib/collector'),
    startTick = new Date().getTime();
    
vows.describe('Collection to DB').addBatch({
    'When collecting samples': {
        topic: function() {
            var collectionProcess = collector.collectToDB(),
                callback = this.callback;
                
            setTimeout(function() {
                collectionProcess.db.getSince(startTick, callback);
                collectionProcess.stop();
            }, 2000);
        }, 
        
        'we have results': function(err, results) {
            assert.ok(results);
        },
        
        'samples have been collected': function(err, results) {
            assert.ok(results.items.cpu && results.items.cpu.length > 0);
        },
        
        'start tick in results is sensible': function(err, results) {
            assert.ok(Math.abs(results.start - startTick) < 500);
        },
        
        'end tick in results is sensible': function(err, results) {
            assert.ok(Math.abs(results.end - (startTick + 2000)) < 500)
        }
    }
}).run();