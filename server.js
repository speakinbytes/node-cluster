// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

    // As workers come up.
    cluster.on('listening', function(worker, address) {
      console.log("A worker with #"+worker.id+" is now connected to " + address.address + ":" + address.port);
    });

    // Count requestes
    function messageHandler(msg) {
      if (msg.cmd && msg.cmd == 'notifyRequest') {
        numReqs += 1;
      }
    }

    // Keep track of http requests
    var numReqs = 0;
    setInterval(function() {
      console.log("numReqs =", numReqs);
    }, 1000);

    Object.keys(cluster.workers).forEach(function(id) {
      cluster.workers[id].on('message', messageHandler);
    });

// Code to run if we're in a worker process
} else {

    // Include Express
    var express = require('express');

    // Create a new Express application
    var app = express();

    // Add a basic route – index page
    app.get('/', function (req, res) {
        res.send('Hello from Worker ' + cluster.worker.id);
        process.send({ cmd: 'notifyRequest' });
    });

    // Bind to a port
    app.listen(3000);
    console.log('Worker ' + cluster.worker.id + ' running!');

}