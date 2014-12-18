var request = require('request');
var config =  require('../config/config');

module.exports.status = {};

module.exports.update = function() {

    var status = {nodes: [], status_count: {}};

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

            //count how many of each stats was returned
            if (!status.status_count[hostStatus.status]) {
                status.status_count[hostStatus.status] = 0;
            }
            status.status_count[hostStatus.status]++;

            //append to payload
            status.nodes.push(hostStatus)

            //do next job
            getNodeStatus();
        });
    }

    //block until either all statues are returned or the maxwait is exceeded
    var maxWait = 10;
    var interval = setInterval(function(){
        if (nodes.length === status.nodes.length || --maxWait === 0){
            //stop waiting
            clearInterval(interval);

            //store result in export
            module.exports.status = status;

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
    var nodes = module.exports.status.nodes;
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