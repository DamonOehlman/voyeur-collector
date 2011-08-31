var DEFAULT_AMOUNT = Math.pow(10, 5);

// define the base agent
var BaseAgent = exports.BaseAgent = function() {
};

BaseAgent.prototype.init = function(callback) {
    if (callback) {
        callback(true);
    } // if
}; // init

BaseAgent.prototype.roundVal = function(value, decimals) {
    // initialise the amount, avoid math if we can
    var amount = decimals ? Math.pow(10, decimals) : DEFAULT_AMOUNT;
    
    return Math.round(value * amount) / amount;
};