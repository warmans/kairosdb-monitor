var request = require('request');

function updateIngestStats(successCallback){

    var startTime = Date.now();

    //use the cluster status to find an UP node to query
    global.memoryCache.get('cluster.status', function (err, result) {

        if (err || !result) { return; }


        if (result.status_count['UN'] < 1) {
            return;
        }

        var payload = {
            success: true,
            query_node: null,
            query_time_ms: null,
            data: [],
            msg: 'OK',
            updated: new Date()
        };

        //find the fastest node to query
        for (var i in result.nodes) {
            var node = result.nodes[i];
            if (node.status === 'UN') {
                if (!payload.query_node || payload.query_node.response_time_ms > node.response_time_ms) {
                    payload.query_node = node;
                }
            }
        }

        var options = {
            uri: 'http://'+payload.query_node.host+'/api/v1/datapoints/query',
            method: 'POST',
            timeout: 300*1000, //5 minute timeout
            body: JSON.stringify({
                "metrics": [{
                    "tags": {},
                    "name": "kairosdb.protocol.http_ingest_count",
                    "aggregators": [{
                        "name": "sum",
                        "align_sampling": true,
                        "sampling": {"value": "1", "unit": "minutes"}
                    }]
                }],
                "cache_time": 0,
                "start_relative": {
                    "value": "1",
                    "unit": "hours"
                }
            })
        };

        request(options, function(error, response, body) {

            payload.query_time_ms = (Date.now() - startTime);

            if (!error && response.statusCode === 200) {

                try {
                    var data = JSON.parse(body);
                    payload.data = data['queries'][0]['results'][0]['values'] ? data['queries'][0]['results'][0]['values'] : [];
                } catch (e) {
                    payload.success = false;
                    payload.msg = e.message;
                }
            } else {
                payload.success = false;
                payload.msg = error.code;
            }

            console.log("ingest query completed in "+payload.query_time_ms);
            global.memoryCache.set('cluster.ingest_stats', payload);
        });
    });
}

module.exports.updateIngestStats = updateIngestStats;