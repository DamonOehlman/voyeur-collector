# Voyeur.io Collector

The collector is the engine room of Voyeur.  A number of different collection agents are implemented, and more are on their way.

## Usage

Using the voyeur.io collector in a project is very simple.  First install the npm package:

`npm install voyeur`

Then, in your application code doing something similar to the following:

```js
var voyeur = require('voyeur'),
    collector = voyeur.collectToDB();

// other stuff goes here

// on exit, stop collecting (this closes the db nicely)
process.on('exit', function() {
    collector.stop();
});
```

No in the above configuration, the collector will happily run up the default agents and save the data to a [leveldb](http://leveldb.googlecode.com/) database in the `samples` directory.  Presumably, however, you also want to get the data out and report on it somehow.

The simplest way to do this is through using the [Connect](http://senchalabs.github.com/connect) middleware that is included in the voyeur package:

If for instance you are using express, you could do something like the following:

```js
var app = express.createServer();

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.use(collector.json(collector.db))
});
```

By default this will expose a `/samples` route that will respond to both request for samples in the last 30 seconds (configurable) and also samples after a certain tick count using the `/samples/123456789` route.

## Advanced Usage

To be completed