var express = require('express');
var router = express.Router();

var cacheManager = require('cache-manager');
var request = require('request');

var monitor = require('../../lib/status-monitor');
var apiResponder = require('../../lib/api-responder');

/**
 * Node status list
 */
router.get('/status', function(req, res) {
    apiResponder.respond(res, true, monitor.status ? monitor.status : {});
});

/**
 * Cluster wide ingest stats
 */
router.get('/ingest', function(req, res) {

    var memoryCache = cacheManager.caching({store: 'memory', ttl: 60000 /* 1 min */});
    var startTime = Date.now();

    memoryCache.wrap(
        'cluster.ingest_stats',
        function (cb) {

            //find the fastest node currently available
            var queryNode = monitor.getFastNode();
            if (!queryNode) {
                cb(null, []);
                return;
            }

            var options = {
                uri: 'http://'+queryNode.hostname+':'+queryNode.port+'/api/v1/datapoints/query',
                method: 'POST',
                timeout: 300*1000, //5 minute timeout
                body: JSON.stringify({
                    "metrics": [{
                        "tags": {},
                        "name": "kairosdb.http.ingest_count",
                        "aggregators": [{"name": "sum", "align_sampling": true, "sampling": {"value": "1", "unit": "minutes"}}]
                    }],
                    "cache_time": 0,
                    "start_relative": { "value": "1", "unit": "hours" }
                })
            };

            request(options, function(error, response, body) {
                if (error) {
                    cb(error);
                } else {
                    if (response.statusCode === 200) {
                        try {
                            var data = JSON.parse(body);

                            var payload = {
                                query_node: queryNode,
                                query_time_ms: Date.now() - startTime,
                                data: data['queries'][0]['results'][0]['values'] ? data['queries'][0]['results'][0]['values'] : [],
                                updated: new Date()
                            };

                            cb(null, payload);

                        } catch (e) {
                            cb(e.message);
                        }
                    } else {
                        cb('Unexpected response status: '+response.statusCode);
                    }
                }
            });
        },
        60000, //60 second cache
        function (err, result) {
            if (err) {
                apiResponder.respond(res, false, {}, [err]);
            } else {
                if (result) {
                    apiResponder.respond(res, true, result);
                } else {
                    apiResponder.respond(res, true, {}, []);
                }
            }
        }
    );
});

module.exports = router;
