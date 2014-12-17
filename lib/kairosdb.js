var monitor = require('./status-monitor');
var hash = require('object-hash');
var cacheManager = require('cache-manager');
var request = require('request');

module.exports.query = function (query, callback, cacheTtl) {

    if (!cacheTtl) {
        cacheTtl = -1;
    }

    var queryNode = monitor.getFastNode();
    if (!queryNode) {
        callback('no query nodes');
        return;
    }

    var memoryCache = cacheManager.caching({store: 'memory', ttl: 60000 /* 1 min */});

    memoryCache.wrap(

        hash(query), //cache using a hash of the query object

        function (cb) {
            var options = {
                uri: 'http://'+queryNode.hostname+':'+queryNode.port+'/api/v1/datapoints/query',
                method: 'POST',
                timeout: 60*1000, //1 minute timeout
                body: JSON.stringify(query)
            };

            request(options, function(error, response, body) {
                if (error) {
                    cb(error);
                } else {
                    if (response.statusCode === 200) {
                        try {
                            var data = JSON.parse(body);
                            cb(null,  data);
                        } catch (e) {
                            cb(e.message);
                        }
                    } else {
                        cb('Unexpected response status: '+response.statusCode);
                    }
                }
            });
        },

        cacheTtl,

        callback //user supplied callback (err, result)
    );
};