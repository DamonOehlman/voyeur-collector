var vows = require('vows'),
    assert = require('assert'),
    voyeur = require('../lib/collector'),
    startTick = new Date().getTime(),
    collector = voyeur.collectToDB();
    
var suite = vows.describe('Collector to DB');

suite.addBatch({
    'When collecting samples': {
        topic: function() {
            var callback = this.callback;
            
            setTimeout(function() {
                collector.db.getSince(startTick, callback, {
                    maxItems: 1000,
                    includeDetail: false
                });
            }, 2000);
        }, 
        
        'we have results': function(err, results) {
            assert.ok(results);
        },
        
        'samples have been collected': function(err, results) {
            assert.ok(results.items.cpu && results.items.cpu.length > 5);
        },
        
        'start tick in results is sensible': function(err, results) {
            assert.ok(Math.abs(results.start - startTick) < 500);
        },
        
        'end tick in results is sensible': function(err, results) {
            assert.ok(Math.abs(results.end - (startTick + 2000)) < 500);
        }
    }
});

suite.addBatch({
    'Middleware tests': {
        topic: function() {
            // create a mock response
            var res = (function() {
                var _this = {
                    out: '',
                    headers: {},
                    
                    setHeader: function(name, val) { _this.headers[name] = val; },
                    end: function(value) { _this.out = value; }
                };
                
                return _this;
            })();
            
            this.callback(null, collector.json(collector.db), res);
        },
        
        'middleware is created': function(err, handler) {
            assert.ok(handler);
        },
        
        'middleware copes with empty requests': function(err, handler) {
            assert.doesNotThrow(function() {
                handler(null);
            });
        },
        
        'responds to general request': function(err, handler, res) {
            handler({ url: '/samples' }, res);
            assert.ok(res.out);
        },
        
        'responds to specific request': function(err, handler, res) {
            handler({ url: '/samples/' + startTick }, res);
            assert.ok(res.out);
        }
    }
});

suite.addBatch({
    'Shutdown collection process': {
        'shutdown': function(c) {
            assert.doesNotThrow(function() {
                collector.stop();
            });
        }
    }
});

suite.run();