var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

//global cache (how does this work without globals?!)
var cacheManager = require('cache-manager');
global.memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 600/*seconds*/});

//config file - globals again...
global.config = require('./config/config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/cluster', require('./routes/api/cluster'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//handle status updates
var clusterStatus = require('./lib/task/cluster/status');
var crontab = require('node-crontab');

//cron context
var cronContext = {status_running: false, ingest_rate_running: false};

//updates cluster status
var clusterStatusJob = crontab.scheduleJob("* * * * *", function(){
    if (this.status_running) {
        console.log("there can be only one");
        //only run one at a time
        crontab.cancelJob(clusterStatusJob);
    } else {
        //race condition...
        this.status_running = true;
    }

    //update the node status cache
    console.log("updating cache...");

    clusterStatus.updateClusterStatus();
    this.status_running = false;

}, null, cronContext);

//initial update to node status
clusterStatus.updateClusterStatus();


//updates ingest rate
var ingestStats = require('./lib/task/cluster/ingest-stats');

var ingestStatsJob = crontab.scheduleJob("*/3 * * * *", function(){
    if (this.ingest_rate_running) {
        console.log("there can be only one");
        //only run one at a time
        crontab.cancelJob(ingestStatsJob);
    } else {
        //race condition...
        this.ingest_rate_running = true;
    }

    //update the node status cache
    console.log("updating cache...");

    ingestStats.updateIngestStats();
    this.ingest_rate_running = false;

}, null, cronContext);

module.exports = app;
