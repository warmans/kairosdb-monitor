var request = require('request');

function updateClusterStatus(){

    var status = {
        nodes: [],
        status_count: {}
    };

    var startTime = Date.now();
    var concurrentRequests = 10;
    var currentNode = 0;
    var nodes = global.config.kairos_hosts ? global.config.kairos_hosts : [];

    for( var i = 0; i < concurrentRequests; i++ ) {
        getNodeStatus();
    }

    function getNodeStatus(){

        var idToFetch = currentNode++;

        if (currentNode > nodes.length) {
            //no more work to do
            return;
        }

        var host = nodes[idToFetch].host;
        var alias = nodes[idToFetch].alias ? nodes[idToFetch].alias : host;
        var options = {
            uri: 'http://'+host+'/api/v1/version',
            timeout: 10000
        };

        request(options, function(error, response, body) {
            console.log("polled "+options.uri);
            var hostStatus = {
                host: host,
                alias: alias,
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
                hostStatus.msg = error.code;
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
    var maxWait = 300;
    var interval = setInterval(function(){
        console.log('waiting...');
        if (nodes.length === status.nodes.length || --maxWait === 0){
            global.memoryCache.set('cluster.status', status);
            clearInterval(interval);
            console.log('completed with '+maxWait+' seconds remaining until timeout');
        }
    }, 1000);
}

module.exports.updateClusterStatus = updateClusterStatus;