var DB = require('node-leveldb').DB;
    
var SampleDB = exports.SampleDB = function(path) {
    this.storage = new DB();
    this.storage.open({ create_if_missing: true }, path || 'samples');
};

SampleDB.prototype.save = function(entry) {
    // initialise defaults
    entry.time = entry.time || new Date().getTime();

    // if we have an entry type and entry data then save
    if (entry.type && entry.value) {
        var serializedValue = JSON.stringify(entry),
            entryKey = entry.time + '_' + entry.type;
        
        storage.put({}, new Buffer(entryKey), new Buffer(serializedValue));
    } // if
};