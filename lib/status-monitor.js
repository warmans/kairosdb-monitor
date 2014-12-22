var request = require('request');
var config =  require('../config/config');

var statusSubscribers = [];
var status_history = {};
var nodes_polled = [];

module.exports.update = function() {

    var startTime = Date.now();
    var concurrentRequests = 10;
    var currentNode = 0;
    var nodes = config.kairos_hosts ? config.kairos_hosts : [];

    for( var i = 0; i < concurrentRequests; i++ ) {
        getNodeStatus();
    }

    function getNodeStatus(){

        var idToFetch = currentNode++;

        if (currentNode > nodes.length) {
            //no more work to do
            return;
        }

        var hostname = nodes[idToFetch].hostname;
        var port = nodes[idToFetch].port ? nodes[idToFetch].port : '8080';
        var label = nodes[idToFetch].label ? nodes[idToFetch].label : hostname;
        var tags = nodes[idToFetch].tags ? nodes[idToFetch].tags : [];

        var options = {
            uri: 'http://'+hostname+':'+port+'/api/v1/version',
            timeout: 10000
        };

        request(options, function(error, response, body) {
            console.log("polled "+options.uri);
            var hostStatus = {
                label: label,
                hostname: hostname,
                port: port,
                tags: tags,
                status: 'NA',
                http_status: response ? response.statusCode : 'NA',
                msg: '',
                response_time_ms: (Date.now() - startTime),
                updated: new Date()
            };

            if (!error && response.statusCode === 200) {
                hostStatus.status = hostStatus.time > 3000 ? 'US' : 'UN';
                hostStatus.msg = JSON.parse(body).version;
            } else {
                hostStatus.status = 'DN';
                if (error) {
                    hostStatus.msg = error.code;
                } else {
                    hostStatus.msg = 'Unknown error: '+response.statusCode;
                }
            }

            //count number completed
            nodes_polled++;

            if (!status_history[idToFetch]) {
                status_history[idToFetch] = [];
            }

            //keep only 10 minutes worth of history
            status_history[idToFetch].unshift(hostStatus);
            while (status_history[idToFetch].length > 60) {
                status_history[idToFetch].pop();
            }

            //do next job
            getNodeStatus();
        });
    }

    //block until either all statues are returned or the maxwait is exceeded
    var maxWait = 10;
    var interval = setInterval(function(){
        if (nodes.length === nodes_polled || --maxWait === 0){
            //stop waiting
            clearInterval(interval);

            //update any subscribers
            for(var i in statusSubscribers) {
                statusSubscribers[i](module.exports.getStatus());
            }

            //start again
            module.exports.start();
        }
    }, 1000);
};

module.exports.start = function(){
    setTimeout(function(){
        console.log('updating node status...');
        module.exports.update();
    }, 10000);
};

module.exports.getFastNode = function(){

    var status = module.exports.getStatus();
    var nodes = status.nodes;
    var fastNode = null;

    for (var i in nodes) {
        var node = nodes[i];
        if (node.status === 'UN') {
            if (!fastNode || fastNode.response_time_ms > node.response_time_ms) {
                fastNode = node;
            }
        }
    }

    return fastNode;
};

module.exports.getStatus = function() {

    var status = {nodes: [], status_count: {}};

    for (var hostKey in status_history) {

        var statusHistory = status_history[hostKey];

        statusHistory.forEach(function(curStatus) {

            //first status in list (most recent)
            if (!status.nodes[hostKey]) {

                //add to status
                status.nodes[hostKey] = curStatus;

                //add additional keys
                curStatus['response_time_ms_sum'] = 0;
                curStatus['response_time_ms_count'] = 0;
                curStatus['response_time_ms_min'] = null;
                curStatus['response_time_ms_max'] = 0;
                curStatus['response_time_ms_history'] = [];

                //count how many of each stats was returned
                if (!status.status_count[curStatus['status']]) {
                    status.status_count[curStatus['status']] = 0;
                }
                status.status_count[curStatus['status']]++;
            }

            //populate additional values from
            if (curStatus['status'] !== 'DN') {

                //cur response time
                var rt = curStatus['response_time_ms'];

                //allow avg
                status.nodes[hostKey]['response_time_ms_sum'] += rt;
                status.nodes[hostKey]['response_time_ms_count'] += 1;

                //min
                if (status.nodes[hostKey]['response_time_ms_min'] === null || rt < status.nodes[hostKey]['response_time_ms']) {
                    status.nodes[hostKey]['response_time_ms_min']  = curStatus['response_time_ms'];
                }
                //max
                if (rt > status.nodes[hostKey]['response_time_ms_max']) {
                    status.nodes[hostKey]['response_time_ms_max']  =  rt;
                }

                status.nodes[hostKey]['response_time_ms_history'].push(rt);
            }
        });
    }

    return status;
};

//allow other modules to subscribe to status updates
module.exports.addSubscriber = function(cb) {
    statusSubscribers.push(cb);
};