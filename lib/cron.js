var crontab = require('node-crontab');

//cron context
var cronContext = {status_running: false, ingest_rate_running: false};

var clusterStatus = require('./cron/cluster/status');

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
var ingestStats = require('./cron/cluster/ingest-stats');

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