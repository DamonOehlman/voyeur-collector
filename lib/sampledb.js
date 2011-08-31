var DB = require('node-leveldb').DB;
    
var SampleDB = exports.SampleDB = function(path) {
    this.storage = new DB();
    this.storage.open({ create_if_missing: true }, path || 'samples');
};

SampleDB.prototype.close = function() {
    this.storage.close();
}; // close

SampleDB.prototype.getSince = function(time, callback, maxItems) {
    var error, 
        targetKey = time.toString(),
        iterator = this.storage.newIterator({}),
        itemCount = maxItems || 1000,
        startTick,
        lastTick,
        items = {};

    // seek to the first item after the specified tick count
    iterator.seek(new Buffer(targetKey));

    // while we have items, and we haven't returned more than max items
    while (iterator.valid() && itemCount--) {
        var keyParts = (iterator.key() || '').toString().split('_'),
            tick = keyParts[0],
            type = keyParts[1] || 'misc',
            rawValue = (iterator.value() || '').toString(),
            item;
            
        if (rawValue) {
            item = JSON.parse(rawValue);

            // ensure we have a start value
            startTick = startTick || tick;

            // check that we have a types array for the current type
            if (! items[type]) {
                items[type] = [];
            } // if

            // calculate the item tick diff
            item.delta = tick - startTick;

            // add the item to the items array
            items[type].push(item);

            // update the last tick
            lastTick = tick;
        } // if

        // get the next value
        iterator.next();
    } // while

    // trigger the callback
    if (callback) {
        callback(error, {
            start: startTick,
            end: lastTick,
            more: itemCount <= 0,

            items: items
        });
    } // if
}; // getSince

SampleDB.prototype.save = function(type, data, details) {
    var tick = new Date().getTime(),
        entry = JSON.stringify({
            data: data,
            details: details
        }),
        entryKey = tick + '_' + type;
        
    this.storage.put({}, new Buffer(entryKey), new Buffer(entry));
};