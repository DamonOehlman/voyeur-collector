var fs = require('fs'),
    cron = require('cron'),
    events = require('events'),
    util = require('util'),
    path = require('path'),
    SampleDB = require('./sampledb').SampleDB,
    agents = [];
    
    
function loadAgents(collector, agentPaths, callback) {
    agentPaths.forEach(function(agentPath) {
        // iterate through the agents in the
        fs.readdir(agentPath, function(err, files) {
            if (! err) {
                files.forEach(function(filename) {
                    var agentId = path.basename(filename, '.js');
                    console.log('Attempting to load agent: ' + agentId);

                    try {
                        var Agent = require('./agents/' + agentId).Agent;
                        
                        // if the Agent class has been defined, then create an instance
                        if (Agent) {
                            // create the agent 
                            var agent = new Agent();
                            
                            // initialise
                            agent.id = agentId;
                            agent.opts = collector.opts[agentId] || {};
                            
                            // initialise the frequency
                            // priority = options first, default frequency (if set) 2nd, cron pattern for every second last
                            agent.frequency = agent.opts.frequency || agent.frequency || '* * * * * *';
                            
                            // add the list of active agents
                            collector.agents.push(agent);
                        } // if
                        else {
                            console.log('Agent= no run handler for agent "' + agentId + '", not registering');
                        } // if..else
                    }
                    catch (e) {
                        console.log('agent "' + filename + '" is invalid: ' + e.message);
                    } // try..catch    
                });
                
                if (callback) {
                    callback();
                } // if
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
    
    // save the options to the collector
    this.opts = opts;
    
    // initialise members
    this.agents = [];
}; // Collector

util.inherits(Collector, events.EventEmitter);

Collector.prototype.loadAgents = function(callback) {
    // load the agents
    loadAgents(this, this.opts.agents, callback);
};

Collector.prototype.scheduleAgents = function() {
    var collector = this;
    
    this.agents.forEach(function(agent) {
        if (typeof agent.frequency == 'string') {
            // check the pattern is a valid cron pattern, and then register the job
            new cron.CronTime(agent.frequency);

            agent.cron = new cron.CronJob(agent.frequency, function() {
                collector.runAgent(agent);
            });
        }
        else {
            setInterval(function() {
                collector.runAgent(agent);
            }, agent.frequency);
        } // if..else
    });
}; // schedule
    
Collector.prototype.runAgent = function(agent) {
    var collector = this;
    
    agent.run(function(data, details) {
        collector.emit('data', agent.id, data, details);
    });
}; // runAgent

exports.collectToDB = function(path, opts) {
    var db, collector;
    
    // create the sample db
    db = new SampleDB(path);
    
    // create the collector and save samples to the db
    collector = new Collector(opts).on('data', function(agentId, data, details) {
        db.save(agentId, data, details);
    });
    
    collector.loadAgents(function() {
        collector.scheduleAgents();
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