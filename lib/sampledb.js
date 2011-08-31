var DB = require('node-leveldb').DB;
    
var SampleDB = exports.SampleDB = function(path) {
    this.storage = new DB();
    this.storage.open({ create_if_missing: true }, path || 'samples');
};

SampleDB.prototype.close = function() {
    this.storage.close();
}; // close

SampleDB.prototype.getSince = function(time, callback, opts) {
    // initialise options
    opts = opts || {};
    opts.maxItems = opts.maxItems || 1000;
    
    // initialise variables
    var error, 
        targetKey = time.toString(),
        iterator = this.storage.newIterator({}),
        itemCount = 0,
        startTick,
        lastTick,
        lastType,
        items = {},
        currentItem;

    // seek to the first item after the specified tick count
    iterator.seek(new Buffer(targetKey));

    // while we have items, and we haven't returned more than max items
    while (iterator.valid() && (itemCount < opts.maxItems)) {
        var keyParts = (iterator.key() || '').toString().split('_'),
            tick = parseInt(keyParts[0], 10),
            type = keyParts[1] || 'misc',
            rawValue = (iterator.value() || '').toString();
            
        // if this item is different to the last, then create a new current item
        if (lastTick !== tick || lastType !== type) {
            if (currentItem) {
                // check that we have a types array for the current type
                if (! items[lastType]) {
                    items[lastType] = [];
                } // if

                // if we have a current item, then add it to the list
                items[lastType].push(currentItem);
                itemCount++;
            } // if

            // create a new item 
            currentItem = {};
        } // if
            
        // if we hae a raw value, and the item is either a data value (key will be tick_type)
        // or we are collecting detail values as well, then process this item
        if (rawValue && (keyParts.length < 3 || opts.includeDetail)) {
            // update the appropriate item data section
            currentItem[keyParts.length < 3 ? 'data' : 'details'] = JSON.parse(rawValue);

            // ensure we have a start value
            startTick = startTick || tick;

            // calculate the item tick diff
            currentItem.delta = tick - startTick;
        } // if

        // update the last tick
        lastTick = tick;
        lastType = type;

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
        entryKey = tick + '_' + type;
        
    // first save the base data
    this.storage.put(
        {}, 
        new Buffer(entryKey), 
        new Buffer(JSON.stringify(data))
    );
    
    // next add the details
    if (details) {
        this.storage.put(
            {}, 
            new Buffer(entryKey + '_' + details), 
            new Buffer(JSON.stringify(details))
        );        
    } // if
};