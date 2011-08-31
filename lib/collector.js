var fs = require('fs'),
    cron = require('cron'),
    events = require('events'),
    util = require('util'),
    path = require('path'),
    SampleDB = require('./sampledb').SampleDB,
    agents = [];
    
    
function loadAgents(collector, agents) {
    agents.forEach(function(agentPath) {
        // iterate through the agents in the
        fs.readdir(agentPath, function(err, files) {
            if (! err) {
                files.forEach(collector.loadAgent);
            } // if
        });
    });
} // loadAgents
    
var Collector = exports.Collector = function(opts) {
    // initialise options
    opts = opts || {};
    opts.agents = opts.agents || [];
    
    // add the core agents to the begin of the requested agents
    opts.agents.unshift(path.join(__dirname, 'agents'));
    
    // initialise members
    this.agents = [];
    
    // load the agents
    loadAgents(this, opts.agents);
}; // Collector

util.inherits(Collector, events.EventEmitter);

Collector.prototype.loadAgent = function(filename) {
    var agentId = path.basename(filename, '.js');
    console.log('Attempting to load agent: ' + agentId);

    try {
        var agent = require('./agents/' + agentId);

        if (agent.run) {
            if (typeof agent.frequency == 'string') {
                // check the pattern is a valid cron pattern, and then register the job
                new cron.CronTime(agent.frequency);
                console.log('pattern ok, registering agent: ' + agentId);

                agent.cron = new cron.CronJob(agent.frequency, function() {
                    this.runAgent(agentId, agent);
                });
            }
            else {
                console.log('agent specified interval, scheduling');

                setInterval(function() {
                    this.runAgent(agentId, agent);
                }, agent.frequency);
            } // if..else
            
            // add the agent
            this.agents.push(agent);
        }
        else {
            console.log('no run handler for agent "' + agentId + '", not registering');
        } // if..else
    }
    catch (e) {
        console.log('agent "' + filename + '" is invalid: ' + e.message);
    } // try..catch    
}; // loadAgent
    
Collector.prototype.runAgent = function(agentId, agent) {
    agent.run(function(data) {
        this.emit('data', agentId, data);
    });
}; // runAgent

exports.collectToDB = function(opts, path) {
    var db, collector;
    
    // create the sample db
    db = new SampleDB(path);
    
    // create the collector and save samples to the db
    collector = new Collector(opts).on('data', function(agentId, data) {
        db.save({
            type: agentId, 
            data: data
        });
    });
    
    return {
        collector: collector,
        db: db,
        
        stop: function() {
            db.close();
            process.exit();
        }
    };
};