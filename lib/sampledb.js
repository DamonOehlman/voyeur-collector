var DB = require('node-leveldb').DB;
    
var SampleDB = exports.SampleDB = function(path) {
    this.storage = new DB();
    this.storage.open({ create_if_missing: true }, path || 'samples');
};

SampleDB.prototype.close = function() {
    this.storage.close();
}; // close

SampleDB.prototype.save = function(type, data, details) {
    var tick = new Date().getTime(),
        serialized = {
            data: JSON.stringify(data),
            details: details ? JSON.stringify(details) : undefined
        },
        entryKey = tick + '_' + type;
        
    this.storage.put({}, new Buffer(entryKey), new Buffer(serialized));
};